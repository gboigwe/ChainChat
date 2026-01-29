/**
 * Mobile Modal Component
 * Mobile-optimized full-screen modal
 */

import React, { useEffect } from 'react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="mobile-modal">
      <div className="mobile-modal-header">
        <button className="back-button" onClick={onClose} aria-label="Close">
          ← Back
        </button>
        {title && <h2 className="modal-title">{title}</h2>}
      </div>

      <div className="mobile-modal-content">{children}</div>

      <style jsx>{`
        .mobile-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .mobile-modal-header {
          display: flex;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e0e0e0;
          background: white;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .back-button {
          background: transparent;
          border: none;
          font-size: 1rem;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          padding: 0.5rem;
        }

        .modal-title {
          flex: 1;
          text-align: center;
          font-size: 1.125rem;
          margin: 0;
          color: #333;
        }

        .mobile-modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          -webkit-overflow-scrolling: touch;
        }

        @media (min-width: 769px) {
          .mobile-modal {
            max-width: 500px;
            max-height: 80vh;
            top: 50%;
            left: 50%;
            right: auto;
            bottom: auto;
            transform: translate(-50%, -50%);
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translate(-50%, -40%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }

          .mobile-modal-header {
            border-radius: 16px 16px 0 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileModal;
