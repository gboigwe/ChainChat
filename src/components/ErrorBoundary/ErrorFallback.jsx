function ErrorFallback({
  error,
  errorType = 'GENERIC',
  title = 'Something went wrong',
  message,
  actions = [],
  showDetails = false,
  icon = '⚠️'
}) {
  const defaultMessage = message || error?.message || 'An unexpected error occurred';

  return (
    <div className="error-fallback">
      <div className="error-fallback-content">
        <div className="error-fallback-icon">{icon}</div>

        <h2 className="error-fallback-title">{title}</h2>

        <p className="error-fallback-message">{defaultMessage}</p>

        {actions.length > 0 && (
          <div className="error-fallback-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`error-button ${action.variant || 'error-button-primary'}`}
                disabled={action.disabled}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {showDetails && error && process.env.NODE_ENV === 'development' && (
          <details className="error-fallback-details">
            <summary>Technical Details (Development Only)</summary>
            <div className="error-fallback-stack">
              <h4>Error Type:</h4>
              <p>{errorType}</p>

              <h4>Error Message:</h4>
              <p>{error.message}</p>

              {error.stack && (
                <>
                  <h4>Stack Trace:</h4>
                  <pre>{error.stack}</pre>
                </>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

ErrorFallback.displayName = 'ErrorFallback';

export default ErrorFallback;
