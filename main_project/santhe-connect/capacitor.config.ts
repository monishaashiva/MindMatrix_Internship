import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.santheconnect.app',
  appName: 'Santhe-Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    hostname: 'localhost'
  },
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"]
    }
  }
};

export default config;
