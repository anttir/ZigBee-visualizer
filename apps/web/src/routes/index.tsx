import { createFileRoute, redirect } from '@tanstack/react-router';
import { isConfigured } from '../lib/storage/config';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Check if hub is configured
    const configured = isConfigured();

    // Redirect based on configuration status
    if (configured) {
      throw redirect({
        to: '/dashboard',
        replace: true,
      });
    } else {
      throw redirect({
        to: '/setup',
        replace: true,
      });
    }
  },
  component: IndexComponent,
});

/**
 * Landing page component
 * This component is rarely rendered as the beforeLoad hook
 * typically redirects before rendering.
 */
function IndexComponent() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
