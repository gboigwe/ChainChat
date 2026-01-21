/**
 * ChainChat - AI DeFi Strategy Engine
 * Main Application Component with Routing
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import RootErrorBoundary from './components/ErrorBoundary/RootErrorBoundary';
import RouteErrorBoundary from './components/ErrorBoundary/RouteErrorBoundary';
import './App.css';

// Lazy load pages for better performance
const Landing = lazy(() => import('./pages/Landing'));
const About = lazy(() => import('./pages/About'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

function App() {
  return (
    <RootErrorBoundary>
      <Router>
        <div className="app">
          <Navigation />
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
              <Route path="/" element={
                <RouteErrorBoundary>
                  <Landing />
                </RouteErrorBoundary>
              } />
              <Route path="/about" element={
                <RouteErrorBoundary>
                  <About />
                </RouteErrorBoundary>
              } />
              <Route path="/how-it-works" element={
                <RouteErrorBoundary>
                  <HowItWorks />
                </RouteErrorBoundary>
              } />
              <Route path="/app" element={
                <RouteErrorBoundary>
                  <DashboardPage />
                </RouteErrorBoundary>
              } />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </RootErrorBoundary>
  );
}

export default App;
