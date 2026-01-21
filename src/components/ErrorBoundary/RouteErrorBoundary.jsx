import { Component } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

class RouteErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RouteErrorBoundary caught error:', error);
    console.error('Route:', this.props.location?.pathname);

    if (window.errorLogger) {
      window.errorLogger.logError({
        error,
        errorInfo,
        context: 'RouteErrorBoundary',
        route: this.props.location?.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }

  componentDidUpdate(prevProps) {
    // Reset error state when navigating to a different route
    if (this.props.location?.pathname !== prevProps.location?.pathname) {
      if (this.state.hasError) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  handleGoBack = () => {
    if (this.props.navigate) {
      this.props.navigate(-1);
    }
  };

  handleGoHome = () => {
    if (this.props.navigate) {
      this.props.navigate('/');
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const routeName = this.props.location?.pathname || 'this page';

      return (
        <div className="error-boundary-route">
          <div className="error-boundary-content">
            <div className="error-icon">🚧</div>
            <h2 className="error-title">Page Error</h2>
            <p className="error-message">
              There was an error loading {routeName}
            </p>
            {error?.message && (
              <p className="error-description">{error.message}</p>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleRetry}
                className="error-button error-button-primary"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoBack}
                className="error-button error-button-secondary"
              >
                Go Back
              </button>
              <button
                onClick={this.handleGoHome}
                className="error-button error-button-tertiary"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to use React Router hooks
function RouteErrorBoundary({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <RouteErrorBoundaryClass navigate={navigate} location={location}>
      {children}
    </RouteErrorBoundaryClass>
  );
}

RouteErrorBoundary.displayName = 'RouteErrorBoundary';

export default RouteErrorBoundary;
