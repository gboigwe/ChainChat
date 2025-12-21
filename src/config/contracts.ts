/**
 * ChainChat Deployed Contracts Configuration
 * Mainnet deployment - All contracts with -v2 suffix
 */

export const NETWORK_CONFIG = {
  network: 'mainnet',
  stacksNode: 'https://api.hiro.so',
  contractOwner: 'SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84',
} as const;

export const CONTRACTS = {
  // DEX Connectors
  alexConnector: 'alex-connector-v2',
  arkadikoConnector: 'arkadiko-connector-v2',
  stackswapConnector: 'stackswap-connector-v2',
  velarConnector: 'velar-connector-v2',

  // Analytics & Tracking
  analyticsTracker: 'analytics-tracker-v2',
  feeTracker: 'fee-tracker-v2',
  metricsAggregator: 'metrics-aggregator-v2',
  performanceTracker: 'performance-tracker-v2',
  volatilityTracker: 'volatility-tracker-v2',

  // Utilities
  arrayUtils: 'array-utils-v2',
  conversionUtils: 'conversion-utils-v2',
  encodingUtils: 'encoding-utils-v2',
  stringUtils: 'string-utils-v2',
  timeUtils: 'time-utils-v2',
  validationUtils: 'validation-utils-v2',

  // Core Financial
  collateralManager: 'collateral-manager-v2',
  creditScoring: 'credit-scoring-v2',
  liquidationEngine: 'liquidation-engine-v2',
  liquidationBot: 'liquidation-bot-v2',
  ltvCalculator: 'ltv-calculator-v2',

  // Governance
  governanceToken: 'governance-token-v2',
  governanceTreasury: 'governance-treasury-v2',
  votingEscrow: 'voting-escrow-v2',

  // Oracles & Risk
  priceOraclePyth: 'price-oracle-pyth-v2',
  priceOracleRedstone: 'price-oracle-redstone-v2',
  priceFeedAggregator: 'price-feed-aggregator-v2',
  mockOracle: 'mock-oracle-v2',
  oracleSecurity: 'oracle-security-v2',
  riskAssessment: 'risk-assessment-v2',
  riskParameters: 'risk-parameters-v2',

  // Security & Access
  accessControl: 'access-control-v2',
  multiSig: 'multi-sig-v2',
  permissionManager: 'permission-manager-v2',
  signatureVerifier: 'signature-verifier-v2',
  kycRegistry: 'kyc-registry-v2',
  whitelistManager: 'whitelist-manager-v2',

  // Vault System
  vaultFactory: 'vault-factory-v2',
  vaultRegistry: 'vault-registry-v2',
  vaultStaking: 'vault-staking-v2',
  vaultRewards: 'vault-rewards-v2',
  vaultEmergency: 'vault-emergency-v2',
  vaultGovernance: 'vault-governance-v2',
  vaultInsurance: 'vault-insurance-v2',
  vaultTimelock: 'vault-timelock-v2',
  vaultTreasury: 'vault-treasury-v2',
  vaultFeeCollector: 'vault-fee-collector-v2',

  // Strategy Contracts
  strategyVault: 'strategy-vault-v2',
  strategyAlexPool: 'strategy-alex-pool-v2',
  strategyArkadikoStake: 'strategy-arkadiko-stake-v2',
  strategyStstxStake: 'strategy-ststx-stake-v2',
  strategyVelarLp: 'strategy-velar-lp-v2',
  strategyYieldFarming: 'strategy-yield-farming-v2',
  strategyLiquidityMining: 'strategy-liquidity-mining-v2',
  strategyLeveragedYield: 'strategy-leveraged-yield-v2',
  strategyLending: 'strategy-lending-v2',
  strategyBorrowing: 'strategy-borrowing-v2',
  strategyArbitrage: 'strategy-arbitrage-v2',
  strategyDeltaNeutral: 'strategy-delta-neutral-v2',
  strategyHedging: 'strategy-hedging-v2',
  strategyBasisTrading: 'strategy-basis-trading-v2',
  strategyOptionsSelling: 'strategy-options-selling-v2',
  strategyFlashLoans: 'strategy-flash-loans-v2',

  // Token Management
  tokenDistribution: 'token-distribution-v2',
  tokenEmissions: 'token-emissions-v2',
  tokenVesting: 'token-vesting-v2',
  wrappedTokenManager: 'wrapped-token-manager-v2',

  // Other Systems
  swapRouter: 'swap-router-v2',
  liquidityAggregator: 'liquidity-aggregator-v2',
  crossChainBridge: 'cross-chain-bridge-v2',
  eventEmitter: 'event-emitter-v2',
  reportingEngine: 'reporting-engine-v2',
  healthFactorMonitor: 'health-factor-monitor-v2',
  proposalExecutor: 'proposal-executor-v2',
  userRegistry: 'user-registry-v2',
  mathLibrary: 'math-library-v2',

  // Testing & Development
  faucet: 'faucet-v2',
  mockDex: 'mock-dex-v2',
  mockToken: 'mock-token-v2',
  testTokenA: 'test-token-a-v2',
  testTokenB: 'test-token-b-v2',
  testHelpers: 'test-helpers-v2',
} as const;

/**
 * Get full contract identifier
 */
export function getContractId(contractName: keyof typeof CONTRACTS): string {
  return `${NETWORK_CONFIG.contractOwner}.${CONTRACTS[contractName]}`;
}

/**
 * Get all contract identifiers
 */
export function getAllContractIds(): Record<keyof typeof CONTRACTS, string> {
  const result = {} as Record<keyof typeof CONTRACTS, string>;

  for (const key in CONTRACTS) {
    result[key as keyof typeof CONTRACTS] = getContractId(key as keyof typeof CONTRACTS);
  }

  return result;
}

/**
 * Contract deployment batches (for reference)
 */
export const DEPLOYMENT_BATCHES = {
  batch0: [
    'alexConnector', 'analyticsTracker', 'arkadikoConnector', 'arrayUtils',
    'collateralManager', 'conversionUtils', 'creditScoring', 'crossChainBridge',
    'encodingUtils', 'eventEmitter', 'faucet', 'feeTracker',
    'governanceToken', 'governanceTreasury', 'healthFactorMonitor', 'kycRegistry',
    'liquidationBot', 'liquidationEngine', 'liquidityAggregator', 'ltvCalculator',
    'mathLibrary', 'metricsAggregator', 'mockDex', 'mockOracle', 'mockToken'
  ],
  batch1: [
    'multiSig', 'oracleSecurity', 'performanceTracker', 'permissionManager',
    'priceFeedAggregator', 'priceOraclePyth', 'priceOracleRedstone', 'proposalExecutor',
    'reportingEngine', 'riskAssessment', 'riskParameters', 'signatureVerifier',
    'stackswapConnector', 'strategyAlexPool', 'strategyArbitrage', 'strategyArkadikoStake',
    'strategyBasisTrading', 'strategyBorrowing', 'strategyDeltaNeutral', 'strategyFlashLoans',
    'strategyHedging', 'strategyLending', 'strategyLeveragedYield', 'strategyLiquidityMining',
    'strategyOptionsSelling'
  ],
  batch2: [
    'strategyStstxStake', 'strategyVault', 'strategyVelarLp', 'strategyYieldFarming',
    'stringUtils', 'swapRouter', 'testHelpers', 'testTokenA', 'testTokenB',
    'timeUtils', 'tokenDistribution', 'tokenEmissions', 'tokenVesting',
    'userRegistry', 'validationUtils', 'vaultEmergency', 'vaultFactory',
    'vaultFeeCollector', 'vaultGovernance', 'vaultInsurance', 'vaultRegistry',
    'vaultRewards', 'vaultStaking', 'vaultTimelock', 'vaultTreasury'
  ],
  batch3: [
    'velarConnector', 'volatilityTracker', 'votingEscrow', 'whitelistManager',
    'wrappedTokenManager'
  ]
} as const;
