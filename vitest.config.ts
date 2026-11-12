import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.spec.ts'],
    setupFiles: ['tests/unit/setup.ts'],
    env: { VITE_OWM_API_KEY: 'test-key' },
    restoreMocks: true,
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/types/**', 'src/**/index.ts', 'src/components/**'],
    },
  },
})
