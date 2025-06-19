// vite.config.js
import { sveltekit } from "file:///C:/Summer/cession-app-v2/cession-app/frontend/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///C:/Summer/cession-app-v2/cession-app/frontend/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: [
      "chart.js/auto"
    ],
    exclude: []
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8089",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  publicDir: "static",
  assetsInclude: ["**/*.ttf"]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxTdW1tZXJcXFxcY2Vzc2lvbi1hcHAtdjJcXFxcY2Vzc2lvbi1hcHBcXFxcZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFN1bW1lclxcXFxjZXNzaW9uLWFwcC12MlxcXFxjZXNzaW9uLWFwcFxcXFxmcm9udGVuZFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovU3VtbWVyL2Nlc3Npb24tYXBwLXYyL2Nlc3Npb24tYXBwL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgc3ZlbHRla2l0IH0gZnJvbSAnQHN2ZWx0ZWpzL2tpdC92aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuXHRwbHVnaW5zOiBbc3ZlbHRla2l0KCldLFxuXHRvcHRpbWl6ZURlcHM6IHtcblx0XHRpbmNsdWRlOiBbXG5cdFx0XHQnY2hhcnQuanMvYXV0bydcblx0XHRdLFxuXHRcdGV4Y2x1ZGU6IFtdXG5cdH0sXG5cdHNlcnZlcjoge1xuXHRcdHBvcnQ6IDUxNzMsXG5cdFx0cHJveHk6IHtcblx0XHRcdCcvYXBpJzoge1xuXHRcdFx0XHR0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwODknLFxuXHRcdFx0XHRjaGFuZ2VPcmlnaW46IHRydWUsXG5cdFx0XHRcdHNlY3VyZTogZmFsc2UsXG5cdFx0XHRcdHdzOiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRwdWJsaWNEaXI6ICdzdGF0aWMnLFxuXHRhc3NldHNJbmNsdWRlOiBbJyoqLyoudHRmJ11cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVSxTQUFTLGlCQUFpQjtBQUM3VixTQUFTLG9CQUFvQjtBQUU3QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixTQUFTLENBQUMsVUFBVSxDQUFDO0FBQUEsRUFDckIsY0FBYztBQUFBLElBQ2IsU0FBUztBQUFBLE1BQ1I7QUFBQSxJQUNEO0FBQUEsSUFDQSxTQUFTLENBQUM7QUFBQSxFQUNYO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTixRQUFRO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsUUFDUixJQUFJO0FBQUEsTUFDTDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxXQUFXO0FBQUEsRUFDWCxlQUFlLENBQUMsVUFBVTtBQUMzQixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
