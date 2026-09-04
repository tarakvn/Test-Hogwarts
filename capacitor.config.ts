import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tarakvn.Hogwarts',
  appName: 'Magic Wand',
  webDir: 'dist/client',
  server: {
    androidScheme: 'https'
  }
};

export default config;