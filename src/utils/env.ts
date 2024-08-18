export function checkIfDebugMode(): boolean {
	return !__dirname.match(/dwp[\\/]dist/);
}
