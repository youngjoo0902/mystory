import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production'
    ? '/react_login/'
    : '/'//배포할 때 경로 설정 (레파지토리 이름 넣기)
})
