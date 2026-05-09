<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Santhe-Connect (ಸಂತೆ ಕನೆಕ್ಟ್)

Santhe-Connect is a modern, heritage-focused web and mobile application designed to help users discover the hidden soul of Karnataka. It highlights local weekly markets (Santhes), traditional off-the-grid eateries, and provides an interactive map for users to pin their findings and share their heritage journey.

## Features

- **Interactive Radar Map:** Discover and pin weekly santhes and local eateries.
- **Native Android Support:** Fully integrated with Capacitor for seamless Android deployment.
- **Secure Authentication:** Integrated with Firebase Authentication, featuring Native Google Sign-In and Email/Password login.
- **GenAI Local Expert:** Uses the Gemini API to generate personalized travel recommendations and insights for heritage spots.
- **Heritage Gamification:** Earn points and unlock badges by pinning locations, sharing reviews, and participating in the local community.
- **Real-time Database:** Powered by Firebase Firestore for real-time synchronization of map pins and reviews.

## Setup & Run Locally

### Prerequisites
- Node.js (v18+)
- Android Studio (for Android deployment)
- A Firebase Project (with Firestore and Authentication enabled)

### Web Development
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Set your environment variables by creating a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Android Deployment
This project is configured to run natively on Android using Capacitor and the `@capacitor-firebase/authentication` plugin.

1. Ensure your `android/app/google-services.json` is placed correctly and contains your app's Android and Web OAuth Client IDs.
2. Build the web assets and sync them with the Android project:
   ```bash
   npm run mobile-sync
   ```
3. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```
4. Run the app on your emulator or physical device.

*Note: For Native Google Sign-In to work on an emulator, make sure you are signed into a Google Account on the emulator device.*
