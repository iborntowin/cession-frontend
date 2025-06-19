import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: [
			'chart.js/auto'
		],
		exclude: []
	},
	server: {
		port: 5173,
		proxy: {
			'/api': {
				target: process.env.VITE_API_URL || 'http://localhost:8089',
				changeOrigin: true,
				secure: true,
				ws: true
			}
		}
	},
	publicDir: 'static',
	assetsInclude: ['**/*.ttf'],
	build: {
		sourcemap: true,
		rollupOptions: {
			output: {
				// Removed manualChunks for chart.js/auto to fix build error
			}
		}
	}
});
