import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.282d188385f34568bd7187b4db78e88d',
  appName: 'Baby Cry Detective',
  webDir: 'dist',
  server: {
    url: 'https://282d1883-85f3-4568-bd71-87b4db78e88d.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#F5E6F0",
      showSpinner: false,
    },
  },
};

export default config;
