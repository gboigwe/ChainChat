/**
 * Strategy Dashboard Component
 * Manages AI-powered DeFi strategies on Stacks
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import {
  callReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  uintCV,
  principalCV,
  stringAsciiCV,
} from '@stacks/transactions';
import { getNetwork } from '../utils/wallet';

const StrategyDashboard = () => {
  const { isConnected, address } = useWallet();
  const [userBalance, setUserBalance] = useState(0);
  const [activeStrategy, setActiveStrategy] = useState(null);
  const [command, setCommand] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Contract addresses (update these with your deployed contracts)
  const VAULT_CONTRACT = import.meta.env.VITE_VAULT_CONTRACT || 'SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84.strategy-vaultx';
  const ENGINE_CONTRACT = import.meta.env.VITE_ENGINE_CONTRACT || 'SPD5ETF2HZ921C8RJG2MHPAN7SSP9AYEYD5GSP84.strategy-enginex';

  // Available commands
  const COMMANDS = [
    { value: 'start safe strategy', label: 'Start Safe Strategy (5-8% APY)' },
    { value: 'start growth strategy', label: 'Start Growth Strategy (10-15% APY)' },
    { value: 'exit all positions', label: 'Exit All Positions' },
    { value: 'set risk low', label: 'Set Risk: Low' },
    { value: 'set risk medium', label: 'Set Risk: Medium' },
    { value: 'set risk high', label: 'Set Risk: High' },
  ];

  // Fetch user balance from vault
  const fetchUserBalance = async () => {
    if (!isConnected || !address) return;

    try {
      const [contractAddress, contractName] = VAULT_CONTRACT.split('.');
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-user-balance',
        functionArgs: [principalCV(address)],
        network: getNetwork(),
        senderAddress: address,
      });

      setUserBalance(Number(result) / 1_000_000); // Convert from micro-STX
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Fetch active strategy
  const fetchActiveStrategy = async () => {
    if (!isConnected || !address) return;

    try {
      const [contractAddress, contractName] = ENGINE_CONTRACT.split('.');
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-user-strategy',
        functionArgs: [principalCV(address)],
        network: getNetwork(),
        senderAddress: address,
      });

      setActiveStrategy(result);
    } catch (error) {
      console.error('Error fetching strategy:', error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchUserBalance();
      fetchActiveStrategy();
    }
  }, [isConnected, address]);

  // Handle deposit
  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const [contractAddress, contractName] = VAULT_CONTRACT.split('.');
      const amountInMicroStx = Math.floor(parseFloat(amount) * 1_000_000);

      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'deposit',
        functionArgs: [uintCV(amountInMicroStx)],
        network: getNetwork(),
        senderAddress: address,
        onFinish: async (data) => {
          setMessage({ type: 'success', text: `Deposit successful! TX: ${data.txId}` });
          await fetchUserBalance();
          setAmount('');
        },
        onCancel: () => {
          setMessage({ type: 'error', text: 'Transaction cancelled' });
        },
      };

      await makeContractCall(txOptions);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle command execution
  const handleExecuteCommand = async () => {
    if (!command) {
      setMessage({ type: 'error', text: 'Please select a command' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const [contractAddress, contractName] = ENGINE_CONTRACT.split('.');
      const commandAmount = command.includes('start') && amount
        ? Math.floor(parseFloat(amount) * 1_000_000)
        : 0;

      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'execute-command',
        functionArgs: [stringAsciiCV(command), uintCV(commandAmount)],
        network: getNetwork(),
        senderAddress: address,
        onFinish: async (data) => {
          setMessage({ type: 'success', text: `Command executed! TX: ${data.txId}` });
          await fetchActiveStrategy();
          await fetchUserBalance();
          setCommand('');
        },
        onCancel: () => {
          setMessage({ type: 'error', text: 'Transaction cancelled' });
        },
      };

      await makeContractCall(txOptions);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="dashboard-placeholder">
        <h2>Connect your wallet to access the dashboard</h2>
        <p>Use WalletConnect to connect from 600+ supported wallets</p>
      </div>
    );
  }

  return (
    <div className="strategy-dashboard">
      <div className="dashboard-header">
        <h1>ChainChat Strategy Dashboard</h1>
        <p>AI-Powered DeFi Strategies on Stacks</p>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Balance Card */}
        <div className="card balance-card">
          <h3>Vault Balance</h3>
          <div className="balance-amount">{userBalance.toFixed(2)} STX</div>
          <div className="deposit-section">
            <input
              type="number"
              placeholder="Amount in STX"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
            />
            <button
              className="btn btn-primary"
              onClick={handleDeposit}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </div>

        {/* Active Strategy Card */}
        <div className="card strategy-card">
          <h3>Active Strategy</h3>
          {activeStrategy ? (
            <div className="strategy-info">
              <p><strong>Strategy ID:</strong> {activeStrategy.strategyId}</p>
              <p><strong>Amount:</strong> {(activeStrategy.amountAllocated / 1_000_000).toFixed(2)} STX</p>
              <p><strong>Status:</strong> {activeStrategy.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          ) : (
            <p>No active strategy</p>
          )}
        </div>

        {/* Command Execution Card */}
        <div className="card command-card">
          <h3>Execute Strategy Command</h3>
          <div className="command-section">
            <select
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="input select"
            >
              <option value="">Select a command...</option>
              {COMMANDS.map((cmd) => (
                <option key={cmd.value} value={cmd.value}>
                  {cmd.label}
                </option>
              ))}
            </select>

            {command.includes('start') && (
              <input
                type="number"
                placeholder="Amount in STX"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
              />
            )}

            <button
              className="btn btn-primary"
              onClick={handleExecuteCommand}
              disabled={loading}
            >
              {loading ? 'Executing...' : 'Execute Command'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyDashboard;
