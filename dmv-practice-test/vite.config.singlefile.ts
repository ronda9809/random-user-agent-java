import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Builds the entire app into ONE self-contained index.html (JS + CSS inlined)
// so it can be opened directly on a phone with no server or internet.
// Usage: npm run build:phone  ->  output in dist-phone/index.html
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-phone',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
})
