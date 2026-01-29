/**
 * Skeleton Loader Component
 * Loading placeholders for better UX
 */

import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'avatar' | 'list';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  count = 1,
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'avatar':
        return <div className="skeleton skeleton-avatar"></div>;
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
        );
      case 'list':
        return (
          <div className="skeleton-list-item">
            <div className="skeleton skeleton-avatar small"></div>
            <div className="skeleton-list-content">
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
            </div>
          </div>
        );
      default:
        return <div className="skeleton skeleton-text"></div>;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-wrapper">
          {renderSkeleton()}
        </div>
      ))}

      <style jsx>{`
        .skeleton-wrapper {
          margin-bottom: 1rem;
        }

        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .skeleton-text {
          height: 16px;
          margin-bottom: 0.5rem;
        }

        .skeleton-text.short {
          width: 60%;
        }

        .skeleton-title {
          height: 24px;
          width: 80%;
          margin-bottom: 1rem;
        }

        .skeleton-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
        }

        .skeleton-avatar.small {
          width: 32px;
          height: 32px;
        }

        .skeleton-card {
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .skeleton-list-item {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          background: white;
          border-radius: 8px;
        }

        .skeleton-list-content {
          flex: 1;
        }
      `}</style>
    </>
  );
};

export default SkeletonLoader;
