import { defineConfig } from 'vite';

export default defineConfig({
    base: '/', // Custom domain is at the root
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
});
