# MyFit v2: Mobile Workout Tracking App

MyFit is a powerful workout tracking app designed to help you achieve your fitness goals effectively. Inspired by the RP Hypertrophy app, MyFit offers a comprehensive set of features including mesocycle creation and exercise progression metrics. Whether you are a beginner or an experienced fitness enthusiast, MyFit is your ideal companion on your fitness journey.

## Features

- **Mesocycle Creation**: Plan your workouts efficiently with the mesocycle creation feature. Organize your training into structured cycles for optimal results.

- **Exercise Progression Metrics**: Track your progress with detailed exercise metrics. Monitor your lifts, repetitions, and weights to stay motivated and on track.

## Getting Started

### Direct web app (can also be installed as a PWA)

https://my-fit-whyash5114.vercel.app/

### Prerequisites

- **Node.js**: Ensure you have Node.js installed. If not, you can download it from [nodejs.org](https://nodejs.org/).
- **MongoDB**: A running instance of Mongo, either in cloud via Atlas or locally [mongodb.com](https://www.mongodb.com/docs/manual/installation/). Create a `.env` file with the `MONGODB_URI` key set to the db's URI.

### Installation

1. **Clone the repository**:

   ```sh
   git clone https://github.com/WhyAsh5114/MyFit.git
   ```

2. **Navigate to the project directory**:

   ```sh
   cd MyFit
   ```

3. **Install dependencies**:

   ```sh
   npm install
   ```

4. **Create .env file from sample env file**:

   ```sh
   cp sample.env .env
   ```

5. **Add authorization secrets to support login via [github](https://authjs.dev/guides/configuring-github)/[google](https://authjs.dev/getting-started/providers/google)**

6. **Start the development server**:

   ```sh
   npm run dev
   ```

   MyFit will be accessible at `http://localhost:5173`.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

MyFit is built with love by the open-source community and inspired by the RP Hypertrophy app.

---
