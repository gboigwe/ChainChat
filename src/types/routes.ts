/**
 * Route Type Definitions
 */

export interface RouteConfig {
  path: string;
  label: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

export type AppRoutes = {
  home: string;
  about: string;
  howItWorks: string;
  app: string;
};
