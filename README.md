# [MyFit](https://my-fit-v3.vercel.app/)

![overview](https://github.com/user-attachments/assets/5290df63-ba02-49b1-93c8-9706046bd176)

A web-based workout tracking application designed to help users track their workouts, monitor progression, and optimize their training. The app supports detailed logging of reps, load, and RIR (Reps in Reserve) across weeks, with complex progression formulas built in to help users progressively overload their exercises.

## Direct link

For web app access, use the [direct link](https://my-fit-v3.vercel.app/). Can be installed on device through supported browsers and platforms, recommended browser is Google Chrome.

## Features

- Track workouts with detailed logs for reps, load, and RIR
- Automatic progressive overload calculations based on past performance
- User-friendly interface built with SvelteKit
- Backend API using tRPC for seamless communication between frontend and backend
- CockroachDB database managed by Prisma for scalable and reliable data storage
- Comprehensive testing suite using Playwright for end-to-end testing

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.16.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [TypeScript](https://www.typescriptlang.org/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/WhyAsh5114/MyFit.git
   cd MyFit
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Set up environment variables:

   - Copy `sample.env` to `.env` and configure the required values, including your CockroachDB connection details.

4. Set up the database (CockroachDB):

   - [Local setup](https://www.cockroachlabs.com/docs/stable/deploy-cockroachdb-on-premises)
   - [Cloud setup (much faster)](https://cockroachlabs.cloud/signup)
   - Run Prisma migrations to set up the database schema:
     ```bash
     npx prisma migrate dev
     ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the app in your browser at `http://localhost:5173`.

### Running Tests

To run the test suite, use the following command:

```bash
npm run test
```

This will execute the Playwright end-to-end tests and any unit tests.

## Usage

Once the app is running, you can create an account, log your workouts, and track your progress over time. The app will automatically calculate progressive overload to help optimize your training.

### Key Concepts:

- **Progressive Overload**: The app uses built-in formulas to adjust your workout plan based on your previous performance, helping you to continually challenge yourself and make progress.
- **RIR (Reps in Reserve)**: You can log your perceived effort for each set to fine-tune your training intensity.

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Security

If you discover a security vulnerability, please follow our [SECURITY.md](./SECURITY.md) guidelines on reporting issues responsibly.

## License

This project is licensed under the GNU Affero General Public License v3.0. See the [LICENSE](./LICENSE) file for more details.

## Acknowledgements

- Special thanks to the open-source community for their contributions to the tools and libraries used in this project.
