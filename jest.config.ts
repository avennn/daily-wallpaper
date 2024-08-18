import { pathsToModuleNameMapper, type JestConfigWithTsJest } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const jestConfig: JestConfigWithTsJest = {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	roots: ['./'],
	modulePaths: [compilerOptions.baseUrl],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
	transform: {
		'^.+\\.[tj]s$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: './tsconfig.json',
			},
		],
	},
};

export default jestConfig;
