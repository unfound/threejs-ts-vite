import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default ({ mode }) => {
  if (mode === 'development') {
    return defineConfig({
      server: {
        host: true
      },
      plugins: [vue()],
      assetsInclude: ['**/*.glb', '**/*.gltf']
    })
  }

  return defineConfig({
    plugins: [vue()],
    assetsInclude: ['**/*.glb', '**/*.gltf'],
    base: '/threejs/',
    build: {
      outDir: 'threejs'
    }
  })
}
