import { createFileRoute, redirect, Link } from '@tanstack/react-router';
import { lazy } from 'react';
import { isConfigured } from '../lib/storage/config';
import { ChevronLeft } from 'lucide-react';

// Lazy load the History component
const History = lazy(() => import('../components/History'));

export const Route = createFileRoute('/history/$deviceId')({
  beforeLoad: () => {
    // Protect this route - redirect to setup if not configured
    if (!isConfigured()) {
      throw redirect({
        to: '/setup',
        replace: true,
      });
    }
  },
  component: HistoryRoute,
});

/**
 * History route component
 * Displays historical data for a specific device
 */
function HistoryRoute() {
  const { deviceId } = Route.useParams();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div>
          <h1 className="text-3xl font-bold mb-2">Device History</h1>
          <p className="text-muted-foreground">
            Historical data and trends for device {deviceId}
          </p>
        </div>
      </div>

      {/* Lazy-loaded History component */}
      <History deviceId={deviceId} />
    </div>
  );
}
