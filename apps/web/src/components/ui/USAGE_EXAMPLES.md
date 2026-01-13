# UI Components Usage Examples

This file contains examples of how to use each shadcn/ui-style component.

## Button

```tsx
import { Button } from "@/components/ui/button"

// Default button
<Button>Click me</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>

// With icon
import { Trash2 } from "lucide-react"
<Button variant="destructive">
  <Trash2 className="mr-2 h-4 w-4" />
  Delete
</Button>
```

## Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

<Card>
  <CardHeader>
    <CardTitle>Sensor Data</CardTitle>
    <CardDescription>Temperature readings from the last hour</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Current temperature: 22°C</p>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

## Badge

```tsx
import { Badge } from "@/components/ui/badge"

// Variants
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>

// Status indicators
<Badge variant="secondary">Online</Badge>
<Badge variant="destructive">Offline</Badge>
```

## Skeleton

```tsx
import { Skeleton } from "@/components/ui/skeleton"

// Loading state
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-32 w-full" />
</div>

// Card skeleton
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-24 w-full" />
  </CardContent>
</Card>
```

## Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Default alert
<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components to your app using the CLI.
  </AlertDescription>
</Alert>

// Destructive alert (errors)
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to connect to ZigBee coordinator.
  </AlertDescription>
</Alert>
```

## Input

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Basic input
<Input type="text" placeholder="Enter sensor name..." />

// With label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>

// Disabled
<Input disabled placeholder="Disabled input" />
```

## Label

```tsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

<div className="space-y-2">
  <Label htmlFor="username">Username</Label>
  <Input id="username" type="text" />
</div>
```

## Switch

```tsx
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Basic switch
<Switch />

// With label (dark mode toggle example)
<div className="flex items-center space-x-2">
  <Switch id="dark-mode" />
  <Label htmlFor="dark-mode">Dark mode</Label>
</div>

// Controlled switch
const [enabled, setEnabled] = useState(false)
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

## Complete Form Example

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

function SettingsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Configure your ZigBee network settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="network-name">Network Name</Label>
          <Input id="network-name" placeholder="My ZigBee Network" />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="auto-discover" />
          <Label htmlFor="auto-discover">Auto-discover devices</Label>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
```

## Importing Multiple Components

```tsx
// Individual imports
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Using the index file (if you prefer)
import { Button, Card, CardContent, Badge } from "@/components/ui"
```
