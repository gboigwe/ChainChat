/**
 * Wallet Modal Component
 * Modal for wallet selection and connection
 */

import { useState } from 'react';
import WalletSelector from './WalletSelector';
import { WalletId } from '../../services/wallets/WalletManager';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (walletId: WalletId, address: string) => void;
  title?: string;
  showInstalledOnly?: boolean;
}

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  onConnect,
  title = 'Connect Your Wallet',
  showInstalledOnly = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen && !isClosing) {
    return null;
  }

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  const handleConnect = (walletId: WalletId, address: string) => {
    if (onConnect) {
      onConnect(walletId, address);
    }
    handleClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className={`wallet-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`wallet-modal ${isClosing ? 'closing' : ''}`}>
        <div className="wallet-modal-header">
          <h2 className="wallet-modal-title">{title}</h2>
          <button
            className="wallet-modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="wallet-modal-content">
          <WalletSelector
            onConnect={handleConnect}
            showInstalledOnly={showInstalledOnly}
          />
        </div>

        <div className="wallet-modal-footer">
          <p className="wallet-modal-help">
            New to Stacks wallets?{' '}
            <a
              href="https://www.stacks.co/explore/get-a-wallet"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
