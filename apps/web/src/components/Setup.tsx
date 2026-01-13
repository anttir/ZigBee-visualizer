import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, CheckCircle, Info, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getConfig, setConfig } from '@/lib/storage/config';
import { createDirigeraClient } from '@/lib/api/dirigera-client';

interface FormData {
  hubAddress: string;
  port: string;
  token: string;
}

interface FormErrors {
  hubAddress?: string;
  port?: string;
  token?: string;
}

interface TestResult {
  success: boolean;
  message: string;
}

export function Setup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    hubAddress: '',
    port: '8443',
    token: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    const config = getConfig();
    if (config) {
      setFormData({
        hubAddress: config.hubAddress,
        port: config.port.toString(),
        token: config.token || '',
      });
    }
  }, []);

  // Validate IP address format
  const validateIpAddress = (ip: string): boolean => {
    // Allow localhost or valid IP address
    if (ip === 'localhost') return true;

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  // Validate port number
  const validatePort = (port: string): boolean => {
    const portNum = parseInt(port, 10);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.hubAddress.trim()) {
      newErrors.hubAddress = 'Hub IP address is required';
    } else if (!validateIpAddress(formData.hubAddress.trim())) {
      newErrors.hubAddress = 'Invalid IP address format';
    }

    if (!formData.port.trim()) {
      newErrors.port = 'Port is required';
    } else if (!validatePort(formData.port.trim())) {
      newErrors.port = 'Port must be between 1 and 65535';
    }

    if (!formData.token.trim()) {
      newErrors.token = 'Authentication token is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    // Clear test result when form changes
    setTestResult(null);
  };

  // Test connection to hub
  const handleTestConnection = async () => {
    if (!validateForm()) {
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const hubAddress = `${formData.hubAddress}:${formData.port}`;
      const client = createDirigeraClient(hubAddress, formData.token);

      // Try to get hub info as a connection test
      const hubInfo = await client.getHubInfo();

      setTestResult({
        success: true,
        message: `Successfully connected to Dirigera Hub (ID: ${hubInfo.id})!`,
      });
    } catch (error: any) {
      console.error('Connection test failed:', error);

      let errorMessage = 'Failed to connect to hub. ';

      if (error.status === 401 || error.status === 403) {
        errorMessage += 'Authentication failed. Please check your token.';
      } else if (error.status === 0 || error.code === 'NETWORK_ERROR') {
        errorMessage += 'Unable to reach the hub. Please verify:\n" Hub IP address and port are correct\n" Hub is online and accessible on your network\n" CORS proxy is configured (browser limitation)';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }

      setTestResult({
        success: false,
        message: errorMessage,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Save configuration
  const handleSaveConfiguration = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Save to localStorage
      setConfig({
        hubAddress: formData.hubAddress.trim(),
        port: parseInt(formData.port.trim(), 10),
        token: formData.token.trim(),
      });

      // Wait a bit to show the saving state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Navigate to dashboard
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('Failed to save configuration:', error);
      setTestResult({
        success: false,
        message: 'Failed to save configuration. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Dirigera Hub Setup</CardTitle>
          <CardDescription>
            Configure your IKEA Dirigera hub connection to start monitoring your ZigBee devices
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Getting Started</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                To connect to your Dirigera hub, you'll need to generate an authentication token.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Find your hub's IP address in your router's DHCP client list</li>
                <li>Press and hold the action button on the bottom of the hub</li>
                <li>Use a tool like <code className="text-xs bg-muted px-1 py-0.5 rounded">curl</code> or Postman to send a POST request to <code className="text-xs bg-muted px-1 py-0.5 rounded">https://[HUB_IP]:8443/v1/oauth/token</code></li>
                <li>The response will contain your authentication token</li>
              </ol>
              <a
                href="https://github.com/Leggin/dirigera#authentication"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
              >
                View detailed instructions
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Hub IP Address */}
            <div className="space-y-2">
              <Label htmlFor="hubAddress">Hub IP Address</Label>
              <Input
                id="hubAddress"
                type="text"
                placeholder="192.168.1.100"
                value={formData.hubAddress}
                onChange={handleChange('hubAddress')}
                className={errors.hubAddress ? 'border-destructive' : ''}
              />
              {errors.hubAddress && (
                <p className="text-sm text-destructive">{errors.hubAddress}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter the IP address of your Dirigera hub (e.g., 192.168.1.100)
              </p>
            </div>

            {/* Port */}
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="8443"
                value={formData.port}
                onChange={handleChange('port')}
                className={errors.port ? 'border-destructive' : ''}
              />
              {errors.port && (
                <p className="text-sm text-destructive">{errors.port}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Default HTTPS port for Dirigera hub is 8443
              </p>
            </div>

            {/* Auth Token */}
            <div className="space-y-2">
              <Label htmlFor="token">Authentication Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter your authentication token"
                value={formData.token}
                onChange={handleChange('token')}
                className={errors.token ? 'border-destructive' : ''}
              />
              {errors.token && (
                <p className="text-sm text-destructive">{errors.token}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Long alphanumeric token obtained during hub authentication
              </p>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert variant={testResult.success ? 'success' : 'destructive'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {testResult.success ? 'Connection Successful' : 'Connection Failed'}
              </AlertTitle>
              <AlertDescription className="whitespace-pre-line">
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTestingConnection || isSaving}
            className="flex-1"
          >
            {isTestingConnection && <Loader2 className="h-4 w-4 animate-spin" />}
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            onClick={handleSaveConfiguration}
            disabled={isTestingConnection || isSaving || (testResult !== null && !testResult.success)}
            className="flex-1"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
