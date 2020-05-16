import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

import autoPreprocess from 'svelte-preprocess';
import rollup_start_dev from './rollup_start_dev';
import alias from '@rollup/plugin-alias';
import path from 'path';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/svelte.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file — better for performance
			css: css => {
				css.write('public/build/bundle.css');
			},

			preprocess: autoPreprocess({
				scss: {
					includePath: [path.resolve(__dirname, 'src/styles')],
					data: `@import 'src/styles/global.scss';`
				}
			})
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),

		// In dev mode, call `npm run start:dev` once
		// the bundle has been generated
		!production && rollup_start_dev,

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),

		alias({
			entries: [
				{
					find: "@",
					replacement: path.resolve(__dirname, 'src/')
				}, {
					find: "@shared",
					replacement: path.resolve(__dirname, 'src/shared')
				}, {
					find: "@styles",
					replacement: path.resolve(__dirname, 'src/styles')
				}
			]
		})
	],
	watch: {
		clearScreen: false
	}
};
