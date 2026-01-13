import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

// Lazy load the Setup component
const Setup = lazy(() => import('../components/Setup').then(module => ({ default: module.Setup })));

export const Route = createFileRoute('/setup')({
  component: SetupRoute,
});

/**
 * Setup route component
 * Displays configuration interface for the Dirigera hub
 */
function SetupRoute() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hub Configuration</h1>
        <p className="text-muted-foreground">
          Configure your IKEA Dirigera hub connection to start monitoring your ZigBee sensors.
        </p>
      </div>

      {/* Lazy-loaded Setup component */}
      <div className="bg-card border rounded-lg shadow-sm">
        <Setup />
      </div>

      {/* Help Section */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg space-y-4">
        <h2 className="text-lg font-semibold">Need Help?</h2>

        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-medium mb-1">Finding your hub IP address:</h3>
            <p className="text-muted-foreground">
              Check your router's connected devices list or use a network scanner app to find
              your Dirigera hub's IP address.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-1">Getting an authentication token:</h3>
            <p className="text-muted-foreground">
              Press the action button on the bottom of your Dirigera hub, then use the pairing
              flow in the setup form within 60 seconds.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-1">Default port:</h3>
            <p className="text-muted-foreground">
              The Dirigera hub typically uses port 8443 for HTTPS connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
