import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smarthajj.app',
  appName: 'SmartHajj',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
