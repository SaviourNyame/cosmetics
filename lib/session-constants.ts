/**
 * Shared between lib/auth.ts (Node runtime, uses firebase-admin) and
 * middleware.ts (Edge runtime, cannot use firebase-admin) — kept in its
 * own file with zero server-only dependencies so both can import it.
 */
export const SESSION_COOKIE_NAME = "__session";
