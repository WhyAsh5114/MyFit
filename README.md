# MyFit

A fitness tracking application built with SvelteKit and Capacitor for cross-platform deployment.

## Development Environment Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- For Android development:
  - [Android Studio](https://developer.android.com/studio)
  - Java Development Kit (JDK) 11+
- For iOS development:
  - [Xcode](https://developer.apple.com/xcode/) (macOS only)
  - [CocoaPods](https://cocoapods.org/)

### Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/WhyAsh5114/MyFit.git
cd MyFit
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Start the development server**

```bash
npm run dev
# or
pnpm dev
```

4. **Build the web app**

```bash
npm run build
# or
pnpm build
```

### Capacitor Setup

1. **Initialize Capacitor with your app**

```bash
npx cap init MyFit com.myfit.app
```

2. **Add platforms**

```bash
# Add Android platform
npx cap add android

# Add iOS platform
npx cap add ios
```

3. **Sync your web code to your native projects**

```bash
npx cap sync
```

4. **Open native IDEs**

```bash
# Open Android Studio
npx cap open android

# Open Xcode
npx cap open ios
```

5. **Live reload during development**

```bash
npm run dev
npx cap run android -l --external
# or
npx cap run ios -l --external
```

## Project Structure

- `/src` - SvelteKit application source code
- `/static` - Static assets to be copied to the build folder
- `/android` - Android platform-specific code
- `/ios` - iOS platform-specific code

## Contributing

Please read our [Contributing Guidelines](.github/CONTRIBUTING.md) before submitting a Pull Request.

## 📜 License

This project is licensed under a **Custom Business Source License (Indefinite Version)**.

### 🔹 **Key License Terms**

- ✅ **Open-Source Code** → You can view, modify, and contribute to the code.
- 🚫 **Commercial Use Requires a Paid License** → Businesses must obtain a license.
- 🚫 **No Internal Organization Use Without a License** → Even internal deployment in a company requires a paid license.
- 🚫 **No Hosting or Embedding in Paid Products** → You **cannot** use this to create a competing service or product.
- ⏳ **This License Will Not Convert to an Open-Source License** → It remains under these terms indefinitely.

### 🔖 **Personal vs. Commercial Use**

| **Usage**                                                  | **Allowed?**                    |
| ---------------------------------------------------------- | ------------------------------- |
| Personal, non-commercial use                               | ✅ Yes                          |
| Modifications & contributions                              | ✅ Yes                          |
| Business use (internal or external)                        | 🚫 No (requires a paid license) |
| Offering as a paid service or embedding in another product | 🚫 No                           |

### 💰 **Need a Commercial License?**

If you want to use this software for business, internal deployment, or as part of a commercial product, you need a **paid commercial license**.

📩 Contact me at **myfit.auth@gmail.com** for licensing details.

MyFit™ is a trademark of Yash Kolekar. All rights reserved.
