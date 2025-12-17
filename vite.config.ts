import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import  '@vitejs/plugin-react/preamble'
import * as path from 'path';

// https://vite.dev/config/
const CLIENT_DIR = "client"; // Directory where the client-side code (entry points and assets) are located
const PUBLIC_DIR = "public"; // Directory from which the server serves static files
const DIST_DIR = "dist"; // Directory where the built files are output (relative to PUBLIC_DIR)
// console.log(__dirname);
export default defineConfig({
  root: path.resolve(__dirname, CLIENT_DIR), // root directory for the client-side source code
  base: `/PerliteVite/${DIST_DIR}/`, // in dev, Vite serves files from here - in production, the server serves production files from here
  build: {
    outDir: path.resolve(__dirname, PUBLIC_DIR, DIST_DIR),
    emptyOutDir: true, // Vite doesn't clear the output directory by default
    manifest: true, // Generate `manifest.json` (required for PHP backend integration)
    rollupOptions: {
      input: path.resolve(CLIENT_DIR, 'main.tsx'), // Entry point for the application
    }
  },

  server: {
    host: 'localhost',
    port: 8000,
    proxy: {
      [`^/(?!${DIST_DIR}/).*`]: {
        target: 'http://localhost:8001', // PHP backend server
        changeOrigin: true, // Required for backend server to receive the correct host header (e.g. virtual hosts)
        // rewrite: path => path.replace(/^\/+/, '/'),
        // configure: (proxy, options) => {
        //   // proxy will be an instance of 'http-proxy'
        //   console.log(proxy);
        //   console.log(options.configure);
        // },
      },

    }
  },
  plugins: [react()],
})
