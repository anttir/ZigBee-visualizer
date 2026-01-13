import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Moon, Sun, Activity, Settings, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isConfigured } from '../lib/storage/config';

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
});

function RootComponent() {
  const [isDark, setIsDark] = useState(false);
  const [configured, setConfigured] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);

    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Check configuration status
  useEffect(() => {
    setConfigured(isConfigured());
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with IKEA branding colors */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          {/* Logo and App Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-yellow-400 rounded-lg blur-sm opacity-75" />
              <div className="relative bg-gradient-to-br from-blue-600 to-yellow-400 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent">
                ZigBee Visualizer
              </h1>
              <p className="text-xs text-muted-foreground">IKEA Dirigera Hub</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {configured && (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
              >
                <Activity className="h-4 w-4" />
                Dashboard
              </Link>
            )}

            <Link
              to="/setup"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"
            >
              <Settings className="h-4 w-4" />
              Setup
            </Link>

            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
              title="About"
            >
              <Info className="h-4 w-4" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              Built for IKEA Dirigera Hub • ZigBee Sensor Monitoring
            </p>
            <div className="flex items-center gap-4">
              <span>Powered by TanStack Router & React Query</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Dev Tools - Only in development */}
      {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
    </div>
  );
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-destructive/10 p-2 rounded-lg">
            <Activity className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-destructive">Application Error</h1>
            <p className="text-sm text-muted-foreground">Something went wrong</p>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <p className="text-sm font-mono text-destructive">{error.message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Reload Page
          </button>
        </div>

        {import.meta.env.DEV && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Stack Trace
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-destructive">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
