// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   optimizeDeps: {
//     exclude: ['lucide-react'],
//   },
// });


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
 
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist', 
    rollupOptions: {
      input: {
   
        app: resolve(__dirname, 'index.html'),
     
        background: resolve(__dirname, 'src/background.ts')
      },
      output: {
       
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background.js'
          return 'assets/[name]-[hash].js'
        }
      }
    }
  }
})
