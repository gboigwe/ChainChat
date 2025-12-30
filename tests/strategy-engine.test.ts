import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;
const user3 = accounts.get("wallet_3")!;
const user4 = accounts.get("wallet_4")!;
const user5 = accounts.get("wallet_5")!;

const contractName = "strategy-engine";

// Helper to extract response values
function getResponseOk(result: any) {
  if (result.result.type === 7) { // ResponseOk
    return result.result.value;
  }
  throw new Error(`Expected ResponseOk, got ${result.result.type}`);
}

function getResponseErr(result: any) {
  if (result.result.type === 8) { // ResponseErr
    return result.result.value;
  }
  throw new Error(`Expected ResponseErr, got ${result.result.type}`);
}

// ════════════════════════════════════════════════════════════════════════════
// SETUP AND SINGLE COMMAND TESTS
// ════════════════════════════════════════════════════════════════════════════

describe("ChainChat Strategy Engine - Bulk Operations Tests", () => {

  beforeEach(() => {
    // Setup is handled in individual tests
  });

  describe("Single Command Execution", () => {
    it("should execute start safe strategy command", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "execute-command",
        [Cl.stringAscii("start safe strategy"), Cl.uint(5000000)],
        user1
      );

      expect(result).toBeOk(Cl.uint(1)); // Strategy ID 1 (Safe)
    });

    it("should execute start growth strategy command", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "execute-command",
        [Cl.stringAscii("start growth strategy"), Cl.uint(10000000)],
        user1
      );

      expect(result).toBeOk(Cl.uint(2)); // Strategy ID 2 (Growth)
    });

    it("should execute risk level commands", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "execute-command",
        [Cl.stringAscii("set risk low"), Cl.uint(0)],
        user1
      );

      expect(result).toBeOk(Cl.uint(1)); // Risk level 1 (Low)
    });

    it("should execute exit command", () => {
      // First start a strategy
      simnet.callPublicFn(
        contractName,
        "execute-command",
        [Cl.stringAscii("start safe strategy"), Cl.uint(5000000)],
        user1
      );

      // Then exit
      const { result } = simnet.callPublicFn(
        contractName,
        "execute-command",
        [Cl.stringAscii("exit all positions"), Cl.uint(0)],
        user1
      );

      expect(result).toBeOk(Cl.uint(5000000)); // Amount returned
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BULK COMMAND EXECUTION TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe("Bulk Command Execution", () => {
    it("should execute multiple commands in bulk", () => {
      const commands = [
        { command: "start safe strategy", amount: 5000000 },
        { command: "set risk medium", amount: 0 },
        { command: "set risk low", amount: 0 }
      ];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-execute-commands",
        [Cl.list(commands.map(cmd => Cl.tuple({
          'command': Cl.stringAscii(cmd.command),
          'amount': Cl.uint(cmd.amount)
        })))],
        user1
      );

      expect(result).toBeOk(Cl.tuple({
        "total-commands": Cl.uint(3),
        results: Cl.list([
          Cl.tuple({
            strategyId: Cl.uint(1),
            timestamp: Cl.uint(simnet.blockHeight)
          }),
          Cl.tuple({
            riskLevel: Cl.uint(2),
            timestamp: Cl.uint(simnet.blockHeight)
          }),
          Cl.tuple({
            riskLevel: Cl.uint(1),
            timestamp: Cl.uint(simnet.blockHeight)
          })
        ])
      }));
    });

    it("should handle maximum bulk commands (5 commands)", () => {
      const commands = [
        { command: "start safe strategy", amount: 5000000 },
        { command: "set risk low", amount: 0 },
        { command: "set risk medium", amount: 0 },
        { command: "set risk high", amount: 0 },
        { command: "exit all positions", amount: 0 }
      ];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-execute-commands",
        [Cl.list(commands.map(cmd => Cl.tuple({
          'command': Cl.stringAscii(cmd.command),
          'amount': Cl.uint(cmd.amount)
        })))],
        user1
      );

      expect(result).toBeOk(Cl.tuple({
        "total-commands": Cl.uint(5),
        results: Cl.list(commands.map((_, i) => {
          if (i === 0) {
            return Cl.tuple({
              strategyId: Cl.uint(1),
              timestamp: Cl.uint(simnet.blockHeight)
            });
          } else if (i === 4) {
            return Cl.tuple({
              amountReturned: Cl.uint(5000000),
              timestamp: Cl.uint(simnet.blockHeight)
            });
          } else {
            return Cl.tuple({
              riskLevel: Cl.uint(i), // 1, 2, 3 for low, medium, high
              timestamp: Cl.uint(simnet.blockHeight)
            });
          }
        }))
      }));
    });

    it("should reject bulk command execution with empty list", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-execute-commands",
        [Cl.list([])],
        user1
      );

      expect(result).toBeErr(Cl.uint(402)); // ERR_INVALID_COMMAND
    });

    it("should validate each command individually in bulk execution", () => {
      const commands = [
        { command: "start safe strategy", amount: 5000000 }, // Valid
        { command: "invalid command", amount: 1000000 } // Invalid
      ];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-execute-commands",
        [Cl.list(commands.map(cmd => Cl.tuple({
          'command': Cl.stringAscii(cmd.command),
          'amount': Cl.uint(cmd.amount)
        })))],
        user1
      );

      expect(result).toBeErr(Cl.uint(402)); // ERR_INVALID_COMMAND from invalid command
    });

    it("should prevent starting multiple strategies in bulk", () => {
      const commands = [
        { command: "start safe strategy", amount: 5000000 },
        { command: "start growth strategy", amount: 10000000 } // Should fail - already have active strategy
      ];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-execute-commands",
        [Cl.list(commands.map(cmd => Cl.tuple({
          'command': Cl.stringAscii(cmd.command),
          'amount': Cl.uint(cmd.amount)
        })))],
        user1
      );

      expect(result).toBeErr(Cl.uint(405)); // ERR_STRATEGY_ACTIVE
    });

    it("should execute mixed command types in bulk", () => {
      // Start strategy first
      simnet.callPublicFn(
        contractName,
        "execute-command",
        [Cl.stringAscii("start safe strategy"), Cl.uint(5000000)],
        user1
      );

      // Then execute mixed commands
      const commands = [
        { command: "set risk medium", amount: 0 },
        { command: "exit all positions", amount: 0 },
        { command: "set risk low", amount: 0 }
      ];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-execute-commands",
        [Cl.list(commands.map(cmd => Cl.tuple({
          'command': Cl.stringAscii(cmd.command),
          'amount': Cl.uint(cmd.amount)
        })))],
        user1
      );

      expect(result).toBeOk(Cl.tuple({
        "total-commands": Cl.uint(3),
        results: Cl.list([
          Cl.tuple({
            riskLevel: Cl.uint(2),
            timestamp: Cl.uint(simnet.blockHeight)
          }),
          Cl.tuple({
            amountReturned: Cl.uint(5000000),
            timestamp: Cl.uint(simnet.blockHeight)
          }),
          Cl.tuple({
            riskLevel: Cl.uint(1),
            timestamp: Cl.uint(simnet.blockHeight)
          })
        ])
      }));
    });

    it("should fail bulk command execution when engine is paused", () => {
      // Pause the engine
      simnet.callPublicFn(contractName, "pause-engine", [], deployer);

      const commands = [{ command: "start safe strategy", amount: 5000000 }];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-execute-commands",
        [Cl.list(commands.map(cmd => Cl.tuple({
          'command': Cl.stringAscii(cmd.command),
          'amount': Cl.uint(cmd.amount)
        })))],
        user1
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED (paused)
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BULK STRATEGY MANAGEMENT TESTS (ADMIN)
  // ════════════════════════════════════════════════════════════════════════════

  describe("Bulk Strategy Management (Admin)", () => {
    it("should allow admin to bulk manage strategies", () => {
      const strategyManagements = [
        { user: user1, action: "start", strategyId: 1, amount: 5000000 },
        { user: user2, action: "start", strategyId: 2, amount: 10000000 }
      ];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list(strategyManagements.map(sm => Cl.tuple({
          'user': Cl.principal(sm.user),
          'action': Cl.stringAscii(sm.action),
          'strategy-id': Cl.uint(sm.strategyId),
          'amount': Cl.uint(sm.amount)
        })))],
        deployer
      );

      expect(result).toBeOk(Cl.list([
        Cl.tuple({
          strategyId: Cl.uint(1),
          timestamp: Cl.uint(simnet.blockHeight)
        }),
        Cl.tuple({
          strategyId: Cl.uint(2),
          timestamp: Cl.uint(simnet.blockHeight)
        })
      ]));
    });

    it("should handle maximum bulk strategy management (10 users)", () => {
      const strategyManagements = Array.from({length: 10}, (_, i) => ({
        user: accounts.get(`wallet_${i + 1}`)!,
        action: "start",
        strategyId: (i % 2) + 1, // Alternate between strategy 1 and 2
        amount: 5000000 + (i * 1000000)
      }));

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list(strategyManagements.map(sm => Cl.tuple({
          'user': Cl.principal(sm.user),
          'action': Cl.stringAscii(sm.action),
          'strategy-id': Cl.uint(sm.strategyId),
          'amount': Cl.uint(sm.amount)
        })))],
        deployer
      );

      expect(result).toBeOk(Cl.list(strategyManagements.map(() => Cl.tuple({
        strategyId: Cl.uint(1), // All should be strategy 1 for this test
        timestamp: Cl.uint(simnet.blockHeight)
      }))));
    });

    it("should allow bulk strategy stopping", () => {
      // First start strategies
      simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list([
          Cl.tuple({
            'user': Cl.principal(user1),
            'action': Cl.stringAscii("start"),
            'strategy-id': Cl.uint(1),
            'amount': Cl.uint(5000000)
          })
        ])],
        deployer
      );

      // Then stop strategies
      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list([
          Cl.tuple({
            'user': Cl.principal(user1),
            'action': Cl.stringAscii("stop"),
            'strategy-id': Cl.uint(0),
            'amount': Cl.uint(0)
          })
        ])],
        deployer
      );

      expect(result).toBeOk(Cl.list([
        Cl.tuple({
          amountReturned: Cl.uint(5000000),
          timestamp: Cl.uint(simnet.blockHeight)
        })
      ]));
    });

    it("should reject bulk strategy management by non-admin", () => {
      const strategyManagements = [{ user: user1, action: "start", strategyId: 1, amount: 5000000 }];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list(strategyManagements.map(sm => Cl.tuple({
          'user': Cl.principal(sm.user),
          'action': Cl.stringAscii(sm.action),
          'strategy-id': Cl.uint(sm.strategyId),
          'amount': Cl.uint(sm.amount)
        })))],
        user1
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
    });

    it("should validate strategy management actions", () => {
      const strategyManagements = [
        { user: user1, action: "start", strategyId: 1, amount: 5000000 }, // Valid
        { user: user2, action: "invalid", strategyId: 1, amount: 5000000 } // Invalid action
      ];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list(strategyManagements.map(sm => Cl.tuple({
          'user': Cl.principal(sm.user),
          'action': Cl.stringAscii(sm.action),
          'strategy-id': Cl.uint(sm.strategyId),
          'amount': Cl.uint(sm.amount)
        })))],
        deployer
      );

      expect(result).toBeErr(Cl.uint(402)); // ERR_INVALID_COMMAND
    });

    it("should handle emergency stops in bulk management", () => {
      // Start a strategy first
      simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list([
          Cl.tuple({
            'user': Cl.principal(user1),
            'action': Cl.stringAscii("start"),
            'strategy-id': Cl.uint(1),
            'amount': Cl.uint(5000000)
          })
        ])],
        deployer
      );

      // Emergency stop
      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list([
          Cl.tuple({
            'user': Cl.principal(user1),
            'action': Cl.stringAscii("emergency-stop"),
            'strategy-id': Cl.uint(0),
            'amount': Cl.uint(0)
          })
        ])],
        deployer
      );

      expect(result).toBeOk(Cl.list([
        Cl.ok(Cl.bool(true))
      ]));
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // BULK RISK SETTINGS UPDATE TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe("Bulk Risk Settings Updates", () => {
    it("should allow admin to bulk update risk settings", () => {
      const riskUpdates = [
        { user: user1, riskLevel: 1 }, // Low risk
        { user: user2, riskLevel: 2 }, // Medium risk
        { user: user3, riskLevel: 3 }  // High risk
      ];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-update-risk-settings",
        [Cl.list(riskUpdates.map(ru => Cl.tuple({
          'user': Cl.principal(ru.user),
          'risk-level': Cl.uint(ru.riskLevel)
        })))],
        deployer
      );

      expect(result).toBeOk(Cl.list([
        Cl.tuple({
          riskLevel: Cl.uint(1),
          maxAllocation: Cl.uint(10000000000), // 10k STX
          timestamp: Cl.uint(simnet.blockHeight)
        }),
        Cl.tuple({
          riskLevel: Cl.uint(2),
          maxAllocation: Cl.uint(25000000000), // 25k STX
          timestamp: Cl.uint(simnet.blockHeight)
        }),
        Cl.tuple({
          riskLevel: Cl.uint(3),
          maxAllocation: Cl.uint(50000000000), // 50k STX
          timestamp: Cl.uint(simnet.blockHeight)
        })
      ]));
    });

    it("should handle maximum bulk risk updates (10 users)", () => {
      const riskUpdates = Array.from({length: 10}, (_, i) => ({
        user: accounts.get(`wallet_${i + 1}`)!,
        riskLevel: ((i % 3) + 1) // Cycle through 1, 2, 3
      }));

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-update-risk-settings",
        [Cl.list(riskUpdates.map(ru => Cl.tuple({
          'user': Cl.principal(ru.user),
          'risk-level': Cl.uint(ru.riskLevel)
        })))],
        deployer
      );

      expect(result).toBeOk(Cl.list(riskUpdates.map(ru => Cl.tuple({
        riskLevel: Cl.uint(ru.riskLevel),
        maxAllocation: Cl.uint(ru.riskLevel === 1 ? 10000000000 :
                               ru.riskLevel === 2 ? 25000000000 : 50000000000),
        timestamp: Cl.uint(simnet.blockHeight)
      }))));
    });

    it("should reject bulk risk updates by non-admin", () => {
      const riskUpdates = [{ user: user1, riskLevel: 1 }];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-update-risk-settings",
        [Cl.list(riskUpdates.map(ru => Cl.tuple({
          'user': Cl.principal(ru.user),
          'risk-level': Cl.uint(ru.riskLevel)
        })))],
        user1
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED
    });

    it("should reject bulk risk updates when engine is paused", () => {
      simnet.callPublicFn(contractName, "pause-engine", [], deployer);

      const riskUpdates = [{ user: user1, riskLevel: 1 }];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-update-risk-settings",
        [Cl.list(riskUpdates.map(ru => Cl.tuple({
          'user': Cl.principal(ru.user),
          'risk-level': Cl.uint(ru.riskLevel)
        })))],
        deployer
      );

      expect(result).toBeErr(Cl.uint(401)); // ERR_UNAUTHORIZED (paused)
    });

    it("should allow user to update their own risk settings", () => {
      const riskUpdates = [{ user: user1, riskLevel: 2 }];

      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-update-risk-settings",
        [Cl.list(riskUpdates.map(ru => Cl.tuple({
          'user': Cl.principal(ru.user),
          'risk-level': Cl.uint(ru.riskLevel)
        })))],
        user1
      );

      expect(result).toBeOk(Cl.list([
        Cl.tuple({
          riskLevel: Cl.uint(2),
          maxAllocation: Cl.uint(25000000000),
          timestamp: Cl.uint(simnet.blockHeight)
        })
      ]));
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe("Bulk Operations Integration", () => {
    it("should handle complete bulk workflow", () => {
      // 1. Bulk update risk settings
      simnet.callPublicFn(
        contractName,
        "bulk-update-risk-settings",
        [Cl.list([
          Cl.tuple({'user': Cl.principal(user1), 'risk-level': Cl.uint(1)}),
          Cl.tuple({'user': Cl.principal(user2), 'risk-level': Cl.uint(2)})
        ])],
        deployer
      );

      // 2. Bulk manage strategies (start)
      simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list([
          Cl.tuple({
            'user': Cl.principal(user1),
            'action': Cl.stringAscii("start"),
            'strategy-id': Cl.uint(1),
            'amount': Cl.uint(5000000)
          }),
          Cl.tuple({
            'user': Cl.principal(user2),
            'action': Cl.stringAscii("start"),
            'strategy-id': Cl.uint(2),
            'amount': Cl.uint(10000000)
          })
        ])],
        deployer
      );

      // 3. Bulk execute user commands
      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-execute-commands",
        [Cl.list([
          Cl.tuple({'command': Cl.stringAscii("set risk medium"), 'amount': Cl.uint(0)}),
          Cl.tuple({'command': Cl.stringAscii("exit all positions"), 'amount': Cl.uint(0)})
        ])],
        user1
      );

      expect(result).toBeOk(Cl.tuple({
        "total-commands": Cl.uint(2),
        results: Cl.list([
          Cl.tuple({
            riskLevel: Cl.uint(2),
            timestamp: Cl.uint(simnet.blockHeight)
          }),
          Cl.tuple({
            amountReturned: Cl.uint(5000000),
            timestamp: Cl.uint(simnet.blockHeight)
          })
        ])
      }));
    });

    it("should maintain strategy integrity across bulk operations", () => {
      // Start strategy via admin
      simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list([
          Cl.tuple({
            'user': Cl.principal(user1),
            'action': Cl.stringAscii("start"),
            'strategy-id': Cl.uint(1),
            'amount': Cl.uint(5000000)
          })
        ])],
        deployer
      );

      // Verify strategy is active
      const strategyBefore = simnet.callReadOnlyFn(contractName, "get-user-strategy", [Cl.principal(user1)], user1);
      expect(strategyBefore.result).toBeSome();

      // Stop via bulk management
      simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list([
          Cl.tuple({
            'user': Cl.principal(user1),
            'action': Cl.stringAscii("stop"),
            'strategy-id': Cl.uint(0),
            'amount': Cl.uint(0)
          })
        ])],
        deployer
      );

      // Verify strategy is stopped
      const strategyAfter = simnet.callReadOnlyFn(contractName, "get-user-strategy", [Cl.principal(user1)], user1);
      expect(strategyAfter.result).toBeSome();

      const strategyData = strategyAfter.result.expectSome().expectTuple();
      expect(strategyData['is-active']).toBe(Cl.bool(false));
    });

    it("should handle mixed bulk operation types efficiently", () => {
      // Setup multiple users
      const users = [user1, user2, user3];

      // Bulk risk updates
      simnet.callPublicFn(
        contractName,
        "bulk-update-risk-settings",
        [Cl.list(users.map((user, i) => Cl.tuple({
          'user': Cl.principal(user),
          'risk-level': Cl.uint((i % 3) + 1)
        })))],
        deployer
      );

      // Bulk strategy starts
      simnet.callPublicFn(
        contractName,
        "bulk-manage-strategies",
        [Cl.list(users.map((user, i) => Cl.tuple({
          'user': Cl.principal(user),
          'action': Cl.stringAscii("start"),
          'strategy-id': Cl.uint((i % 2) + 1),
          'amount': Cl.uint(5000000 + (i * 1000000))
        })))],
        deployer
      );

      // Bulk command execution by one user
      const { result } = simnet.callPublicFn(
        contractName,
        "bulk-execute-commands",
        [Cl.list([
          Cl.tuple({'command': Cl.stringAscii("set risk high"), 'amount': Cl.uint(0)}),
          Cl.tuple({'command': Cl.stringAscii("set risk low"), 'amount': Cl.uint(0)})
        ])],
        user1
      );

      expect(result).toBeOk(Cl.tuple({
        "total-commands": Cl.uint(2),
        results: Cl.list([
          Cl.tuple({
            riskLevel: Cl.uint(3),
            timestamp: Cl.uint(simnet.blockHeight)
          }),
          Cl.tuple({
            riskLevel: Cl.uint(1),
            timestamp: Cl.uint(simnet.blockHeight)
          })
        ])
      }));
    });
  });
});
