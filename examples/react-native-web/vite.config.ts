import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Alias react-native → react-native-web so shared RN primitives render in the browser.
 * GuideLoop still requires a DOM (web or RN-Web), not pure native iOS/Android.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
  },
  server: { port: 3103 },
  optimizeDeps: {
    include: ['guideloop'],
  },
});
