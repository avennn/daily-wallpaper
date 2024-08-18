import { defineConfig, type Options } from 'tsup';

const baseOption: Options = {
	format: 'esm',
	target: 'esnext',
	platform: 'node',
	shims: true,
	splitting: true,
	clean: true,
	cjsInterop: true,
	dts: true,
	minify: false,
};

export default defineConfig([
	{
		...baseOption,
		entry: ['src/index.ts'],
		outDir: 'dist',
	},
	{
		...baseOption,
		entry: ['src/bin/cli.ts'],
		outDir: 'dist/bin',
	},
]);
