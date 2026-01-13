# ZigBee Visualizer 🏠📊

Modern, cross-platform visualization for IKEA Dirigera smart home sensor data. Monitor temperature, humidity, air quality (PM2.5, VOC) from your Aqara and IKEA sensors with beautiful real-time dashboards and historical charts.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB)

## ✨ Features

- 🌡️ **Real-time Monitoring** - Live sensor data with auto-refresh every 30 seconds
- 📈 **Historical Charts** - Interactive graphs showing trends over 24h, 7d, or 30d
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS and shadcn/ui components
- 🌓 **Dark Mode** - Full dark mode support with system preference detection
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile
- 💾 **Local Storage** - Historical data stored in IndexedDB (no cloud required)
- 🔒 **Privacy First** - All data stays on your device and local network
- 🚀 **Fast** - Optimized with code splitting and lazy loading

### Supported Sensors

- **Temperature & Humidity** (Aqara, IKEA TIMMERFLOTTE)
- **Air Quality** - PM2.5 particles (IKEA VINDSTYRKA)
- **VOC Index** - Volatile Organic Compounds (IKEA VINDSTYRKA)
- **Multi-room** - Support for sensors in different rooms

## 🌐 Live Demo

**Web App:** [https://anttir.github.io/ZigBee-visualizer/](https://anttir.github.io/ZigBee-visualizer/)

> **Note:** You'll need access to your Dirigera hub's IP address and API token to use the app.

## 🏗️ Project Structure

This is a monorepo containing multiple applications:

```
ZigBee-visualizer/
├── apps/
│   ├── android/          # 📱 Android app (Kotlin + Jetpack Compose) - Coming Soon
│   └── web/              # 🌐 Web app (React + TypeScript + Vite)
└── packages/
    └── shared-types/     # 📦 Shared TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and **pnpm** 9+
- **IKEA Dirigera Hub** connected to your local network
- **Authentication Token** from your Dirigera hub

### Installation

```bash
# Clone the repository
git clone https://github.com/anttir/ZigBee-visualizer.git
cd ZigBee-visualizer

# Install dependencies
pnpm install

# Start the web app
pnpm dev
```

The app will open at `http://localhost:3000`

### Getting Your Dirigera Hub Token

1. **Find your hub's IP address:**
   - Open your router's admin panel
   - Look for a device named "DIRIGERA" or check IKEA Home app settings

2. **Generate authentication token:**
   ```bash
   # Install dirigera CLI tool
   npm install -g dirigera

   # Generate token (press the button on bottom of hub when prompted)
   dirigera authenticate <YOUR_HUB_IP>
   ```

3. **Configure the app:**
   - Open the web app
   - Go to Setup page
   - Enter your hub's IP address (e.g., `192.168.1.100`)
   - Paste the authentication token
   - Click "Test Connection" then "Save"

## 📚 Documentation

### Web App

See [apps/web/README.md](./apps/web/README.md) for:
- Development guide
- Build instructions
- Deployment options
- Troubleshooting CORS issues

### Android App

Coming soon! The Android app will feature:
- Native Kotlin with Jetpack Compose UI
- Local network connectivity
- Push notifications for sensor alerts
- Offline data storage with Room database

## 🎨 Technology Stack

### Web App

| Technology | Purpose |
|------------|---------|
| **React 18.3** | UI framework with hooks and concurrent features |
| **TypeScript 5.7** | Type safety and enhanced DX |
| **Vite 6** | Lightning-fast build tool and dev server |
| **TanStack Router** | Type-safe file-based routing |
| **TanStack Query** | Powerful async state management |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Beautiful, accessible component library |
| **Recharts** | Responsive chart library |
| **Axios** | HTTP client for API calls |
| **IndexedDB** | Local database for historical data |

### Color Scheme

- **Primary**: Deep Indigo (`#6366f1`) - Professional and modern
- **Accent**: Teal (`#14b8a6`) - Perfect for temperature/active states
- **Charts**: Indigo, Teal, Emerald, Amber, Purple
- **Dark Mode**: Enhanced contrast with adjusted brightness

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start web dev server
pnpm dev:web          # Same as above

# Building
pnpm build            # Build web app for production
pnpm build:web        # Same as above

# Preview production build
pnpm preview

# Type checking
pnpm type-check

# Clean
pnpm clean            # Remove all node_modules and build artifacts
```

### Project Commands

```bash
# Work with specific packages
pnpm --filter web dev           # Run command in web app only
pnpm --filter shared-types build # Build shared types package

# Install package in specific app
pnpm --filter web add <package-name>
```

## 📦 Deployment

### GitHub Pages (Automatic)

The web app automatically deploys to GitHub Pages on every push to the main branch.

**Manual deployment:**
```bash
pnpm build:web
# Artifacts are in apps/web/dist/
```

### Self-Hosting

You can host the web app on any static hosting service:

1. **Build the app:**
   ```bash
   pnpm build:web
   ```

2. **Deploy `apps/web/dist/` to:**
   - Netlify
   - Vercel
   - Cloudflare Pages
   - Your own web server

3. **Important:** Update `base` path in `apps/web/vite.config.ts` if not hosting at root.

## ⚠️ Known Limitations

### CORS Issues

The Dirigera hub API uses **self-signed HTTPS certificates** and **does not include CORS headers**. This means direct browser requests will fail in production.

**Solutions:**

1. **Development:**
   - Use browser extension like "CORS Unblock" (Chrome/Firefox)
   - Or run Chrome with `--disable-web-security` flag (dev only!)

2. **Production:**
   - Deploy a backend proxy (Node.js/Python) that forwards requests to hub
   - Or use the Android app which doesn't have CORS restrictions

See [apps/web/README.md](./apps/web/README.md#cors-workarounds) for detailed solutions.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs** - Open an issue with details and reproduction steps
2. **Suggest features** - Describe your idea and use case
3. **Submit PRs** - Fork, create a feature branch, and submit a pull request

### Development Setup

```bash
# Install dependencies
pnpm install

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and test
pnpm dev

# Build to verify
pnpm build

# Commit and push
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- **IKEA** for the Dirigera hub and smart home ecosystem
- **[Leggin/dirigera](https://github.com/Leggin/dirigera)** - Python library that inspired this project
- **[lpgera/dirigera](https://github.com/lpgera/dirigera)** - TypeScript library reference
- **Community** - All the developers who reverse-engineered the Dirigera API

## 🐛 Troubleshooting

### App won't connect to hub

1. **Check hub is online** - Look for solid white light on Dirigera
2. **Verify IP address** - Hub IP may change if using DHCP (set static IP in router)
3. **Test token** - Tokens may expire, generate a new one if needed
4. **Firewall** - Ensure port 8443 is not blocked
5. **Same network** - Hub and device must be on same local network

### No historical data showing

1. **Wait 30 seconds** - First data point needs to be collected
2. **Check IndexedDB** - Open browser DevTools → Application → IndexedDB
3. **Clear and reload** - Clear site data and let it collect fresh data

### Charts not rendering

1. **Browser compatibility** - Use modern browser (Chrome 90+, Firefox 88+, Safari 14+)
2. **JavaScript enabled** - Ensure JS is not blocked
3. **Check console** - Look for errors in browser DevTools console

## 📧 Support

- **Issues:** [GitHub Issues](https://github.com/anttir/ZigBee-visualizer/issues)
- **Discussions:** [GitHub Discussions](https://github.com/anttir/ZigBee-visualizer/discussions)

---

**Made with ❤️ for the smart home community**