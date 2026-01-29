/**
 * Update Prompt Component
 * Prompts user when app update is available
 */

import React from 'react';

interface UpdatePromptProps {
  isVisible: boolean;
  onUpdate: () => void;
  onDismiss: () => void;
}

const UpdatePrompt: React.FC<UpdatePromptProps> = ({
  isVisible,
  onUpdate,
  onDismiss,
}) => {
  if (!isVisible) return null;

  return (
    <div className="update-prompt">
      <div className="update-content">
        <span className="update-icon">🔄</span>
        <div className="update-text">
          <h3>Update Available</h3>
          <p>A new version of ChainChat is ready</p>
        </div>
      </div>
      <div className="update-actions">
        <button className="update-btn" onClick={onUpdate}>
          Update Now
        </button>
        <button className="dismiss-btn" onClick={onDismiss}>
          Later
        </button>
      </div>

      <style jsx>{`
        .update-prompt {
          position: fixed;
          top: 1rem;
          left: 1rem;
          right: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
          animation: slideDown 0.3s ease;
          color: white;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .update-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .update-icon {
          font-size: 2rem;
        }

        .update-text h3 {
          margin: 0;
          font-size: 1rem;
          color: white;
        }

        .update-text p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .update-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .update-btn {
          padding: 0.5rem 1.5rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .dismiss-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.5);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          white-space: nowrap;
        }

        @media (min-width: 769px) {
          .update-prompt {
            max-width: 400px;
            left: auto;
            right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdatePrompt;
