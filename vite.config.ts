import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { defineConfig } from 'vite';

/** @type {import('vite').UserConfig} */
const config = {
	/*server: {
		https: {
			key: './private.key',
			cert: './certificate.crt'
		}
	},*/
	plugins: [sveltekit()],
	/*build: {
		rollupOptions: {
		  plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
		},
	},*/
	resolve: {
		alias: {
			/*"stream": "vite-compatible-readable-stream",*/
			stream: 'stream-browserify',
			process: 'process/browser',
			zlib: 'browserify-zlib',
			util: 'util',
			path: 'path-browserify'
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
};

export default config;
