/**
 * Deep-converts Firestore Timestamp values (class instances with a
 * `toDate()` method) into plain JS `Date` objects.
 *
 * Server Components may fetch documents via the Admin SDK and pass them to
 * Client Components (e.g. a table). React's RSC serialization supports
 * plain objects, arrays, and a handful of built-ins like `Date` — but not
 * arbitrary class instances such as Firestore's `Timestamp`. Every read
 * that flows into a Client Component must be run through this first.
 */
export function serializeDoc<T>(data: T): T {
  if (data === null || data === undefined || typeof data !== "object") {
    return data;
  }
  if (data instanceof Date) {
    return data;
  }
  if (typeof (data as { toDate?: unknown }).toDate === "function") {
    return (data as unknown as { toDate: () => Date }).toDate() as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => serializeDoc(item)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    result[key] = serializeDoc(value);
  }
  return result as T;
}

/**
 * Reads a date out of a field that's typed as TimestampLike but has, at
 * runtime, already been through serializeDoc() (and is therefore a plain
 * Date). Use this in Client Components instead of calling `.toDate()`
 * directly, since a raw Firestore Timestamp is never actually reachable
 * there.
 */
export function toDate(value: { toDate: () => Date } | Date | undefined | null): Date | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value : value.toDate();
}
