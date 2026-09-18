import type { CapacitorConfig } from '@capacitor/cli';

// Optional live server URL (e.g. your deployed Vercel/Hostinger Next.js URL or local dev server IP)
const serverUrl = process.env.CAPACITOR_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.omnitask.app',
  appName: 'OmniTask',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true,
    ...(serverUrl ? { url: serverUrl } : {}),
  },
};

export default config;
