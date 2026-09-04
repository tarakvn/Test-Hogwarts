import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tarakvn.Hogwarts',
  appName: 'Magic Wand',
  webDir: 'dist/client',
  server: {
    hostname: 'localhost',
    androidScheme: 'https'
  }
};

export default config;