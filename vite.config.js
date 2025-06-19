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
				target: 'http://localhost:8089',
				changeOrigin: true,
				secure: false,
				ws: true
			}
		}
	},
	publicDir: 'static',
	assetsInclude: ['**/*.ttf']
});
