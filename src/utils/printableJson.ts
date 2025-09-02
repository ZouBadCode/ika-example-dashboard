export function toPrintableJSON(value: unknown) {
  const seen = new WeakSet<object>();

  const u8ToHex = (u8: Uint8Array) =>
    "0x" + Array.from(u8).map((b) => b.toString(16).padStart(2, "0")).join("");

  return JSON.stringify(
    value,
    (_key, v) => {
      if (typeof v === "bigint") return v.toString();
      if (v instanceof Uint8Array) return u8ToHex(v);
      if (v instanceof Map) return Object.fromEntries(v.entries());
      if (v instanceof Set) return Array.from(v.values());

      if (v && typeof v === "object") {
        if (seen.has(v as object)) return "[Circular]";
        seen.add(v as object);
      }
      return v;
    },
    2
  );
}
