# Contributing to MyFit

We welcome contributions to MyFit! Whether it's reporting an issue, improving documentation, adding new features, or fixing bugs, your help is greatly appreciated. Please follow the guidelines below to ensure a smooth contribution process.

## Getting Started

### Prerequisites

Make sure you have the following tools installed:

- **Node.js** (v20.16.0 or higher)
- **npm**
- **TypeScript**
- **Docker** (if applicable, for local CockroachDB setup)

### Setup Instructions

1. Fork the repository.
2. Clone your forked repository:
   ```bash
   git clone https://github.com/WhyAsh5114/MyFit.git
   cd MyFit
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up your environment variables. Copy `.env.example` to `.env` and configure the necessary values.

5. Start the development server:
   ```bash
   npm run dev
   ```

### Code Structure

- **Frontend**: The app is built with SvelteKit
- **Backend**: API calls are handled using tRPC
- **Database**: Prisma with CockroachDB as the provider
- **Testing**: Playwright is used for end-to-end testing

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please check the [existing issues](https://github.com/WhyAsh5114/MyFit/issues) first. If your issue is not listed, create a new one and provide as much detail as possible.

### Proposing Changes

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes, and ensure the code is properly formatted and linted
3. Write tests if necessary
4. Commit your changes with a meaningful commit message:
   ```bash
   git commit -m "Add feature: your-feature-name"
   ```
5. Push your changes to your forked repository:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a pull request (PR) to the main repository. Make sure to describe your changes clearly in the PR description

### Code Guidelines

- **TypeScript**: Let TypeScript infer return types wherever possible
- **Testing**: Ensure all tests pass before opening a PR
- **Documentation**: Update documentation when changes affect significant functionality

### Testing

Run the tests to ensure your changes don't break anything:

```bash
npm run test
```

### Creating New Tests

Follow these steps to create new tests using Playwright:

1. Install Playwright if you haven't already:
   ```bash
   npx install playwright
   ```

2. In your development environment, log in with any account.

3. Open your browser's developer tools, navigate to the `Application` tab, and locate the `authjs.session-token` cookie. Copy its value.

4. Create an `auth.json` file in the root directory of your project with the following content:

   ```json
   {
     "cookies": [
       {
         "name": "authjs.session-token",
         "value": "YOUR_SESSION_TOKEN",
         "domain": "localhost",
         "path": "/",
         "expires": -1,
         "httpOnly": true,
         "secure": false,
         "sameSite": "Lax"
       }
     ]
   }
   ```

   Replace `"YOUR_SESSION_TOKEN"` with the actual session token you copied.

5. Generate your test code using Playwright by running:

   ```bash
   npx playwright codegen localhost:5173 --load-storage=auth.json
   ```

This will launch a browser instance with your stored session, allowing you to record new test interactions.

We use Playwright for end-to-end testing, so make sure to write tests covering new features or bug fixes.

## Code Reviews

All PRs will be reviewed by project maintainers. We may request changes or provide feedback to ensure the code aligns with the project's standards.

### Thank You

Thank you for taking the time to contribute to MyFit! Your efforts help make this project better for everyone.
