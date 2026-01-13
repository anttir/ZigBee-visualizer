import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy } from 'react';
import { isConfigured } from '../lib/storage/config';

// Lazy load the Dashboard component
const Dashboard = lazy(() => import('../components/Dashboard').then(module => ({ default: module.Dashboard })));

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    // Protect this route - redirect to setup if not configured
    if (!isConfigured()) {
      throw redirect({
        to: '/setup',
        replace: true,
      });
    }
  },
  component: DashboardRoute,
});

/**
 * Dashboard route component
 * Displays all sensors and their current readings
 */
function DashboardRoute() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sensor Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of your ZigBee sensors
          </p>
        </div>
      </div>

      {/* Lazy-loaded Dashboard component */}
      <Dashboard />
    </div>
  );
}
