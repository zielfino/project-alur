const activeLocks = new Map<string, boolean>();

// export async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
// 	if (activeLocks.has(key)) {
// 		throw new Error('Another operation is still running.');
// 	}
// 	activeLocks.set(key, true);
// 	try {
// 		return await fn();
// 	} finally {
// 		activeLocks.delete(key);
// 	}
// }

export async function withLock<T>(key: string, fn: () => Promise<T>, ttl = 5000): Promise<T> {
	if (activeLocks.has(key)) {
		throw new Error('Another operation is still running.');
	}
	activeLocks.set(key, true);
	const timeout = setTimeout(() => activeLocks.delete(key), ttl);
	try {
		return await fn();
	} finally {
		clearTimeout(timeout);
		activeLocks.delete(key);
	}
}