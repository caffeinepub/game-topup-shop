/**
 * Generate a deterministic 6-digit member code from a Principal ID string.
 * The code is always 100000–999999.
 */
export function principalToCode(principalId: string): string {
  let hash = 0;
  for (let i = 0; i < principalId.length; i++) {
    const char = principalId.charCodeAt(i);
    hash = (hash * 31 + char) >>> 0; // unsigned 32-bit
  }
  // Map to 100000–999999
  const code = 100000 + (hash % 900000);
  return code.toString().padStart(6, "0");
}
