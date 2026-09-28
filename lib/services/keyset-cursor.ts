/**
 * Opaque keyset cursors for the tribe feed and photo list (TRI-360): the last row's sort key, bound to the sort it was
 * made for, so a cursor from another sort is rejected instead of silently paging the wrong order. Timestamps travel
 * as Postgres text, so microseconds survive the round trip (as in the notification feed).
 */

export class InvalidCursorError extends Error {
  constructor() {
    super("Invalid cursor");
  }
}

type KeyKind = "uuid" | "timestamp" | "int" | "bool";
type KeyValue<K extends KeyKind> = K extends "int" ? number : K extends "bool" ? boolean : string;
type Key<Ks extends readonly KeyKind[]> = { [I in keyof Ks]: KeyValue<Ks[I]> };

const valid: Record<KeyKind, (value: unknown) => boolean> = {
  uuid: (value) => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value),
  timestamp: (value) => typeof value === "string" && !Number.isNaN(Date.parse(value.replace(" ", "T"))),
  int: (value) => Number.isSafeInteger(value) && (value as number) >= 0,
  bool: (value) => typeof value === "boolean",
};

export function encodeCursor(sort: string, key: readonly (string | number | boolean)[]): string {
  return Buffer.from(JSON.stringify([sort, ...key])).toString("base64url");
}

/** The key a cursor carries, checked against the kinds the sort expects. Throws `InvalidCursorError`. */
export function decodeCursor<const Ks extends readonly KeyKind[]>(cursor: string, sort: string, kinds: Ks): Key<Ks> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, "base64url").toString());
  } catch {
    throw new InvalidCursorError();
  }
  if (!Array.isArray(parsed) || parsed[0] !== sort || parsed.length !== kinds.length + 1) throw new InvalidCursorError();
  const key = parsed.slice(1);
  if (!kinds.every((kind, i) => valid[kind](key[i]))) throw new InvalidCursorError();
  return key as Key<Ks>;
}
