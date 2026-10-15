/** Keep twelve significant digits: remove platform libm noise without rounding pF/nH values to zero. */
export function canonical(value) {
	if (typeof value === "number") {
		if (!Number.isFinite(value))
			throw Error("Non-finite number in source circuit");
		return Number(value.toPrecision(12));
	}
	if (Array.isArray(value)) return value.map(canonical);
	if (value && typeof value === "object")
		return Object.fromEntries(
			Object.entries(value)
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([k, v]) => [k, canonical(v)]),
		);
	return value;
}

export function differences(a, b, path = "$", result = []) {
	if (Object.is(a, b)) return result;
	if (a && b && typeof a === "object" && typeof b === "object") {
		for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
			differences(a[key], b[key], `${path}.${key}`, result);
	} else if (result.length < 12) result.push({ path, previous: a, current: b });
	return result;
}
