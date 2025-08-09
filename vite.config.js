import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Detect environment from CI/CD
// - GitHub Actions: sets GITHUB_REPOSITORY and GITHUB_ACTIONS
// - Cloudflare Pages: sets CF_PAGES
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'
let base = '/'

if (isGitHubPages) {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || ''
  base = `/${repoName}/`
}

export default defineConfig({
  base,
  build: {
    outDir: 'build'
  },
  plugins: [react()]
})