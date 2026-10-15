/**
 * Shared CLI argument parsing and defaults.
 * Used by: ci-review.mjs, run-evals-live.mjs
 */

/**
 * Ceiling on the model's output tokens, and the only place the number lives:
 * both scripts and the GitHub Action fall back to it rather than restating it.
 * A report that hits the ceiling is truncated, and truncation fails in the
 * wrong direction — fewer findings parse out, so the Health Score comes back
 * HIGHER and a fail-below gate can pass a run it should have failed.
 */
export const DEFAULT_MAX_TOKENS = 4096;

/**
 * Resolve a --max-tokens value to a positive integer, or null if it is not one.
 *
 * Null is the caller's cue to exit: parseArgs() yields the boolean `true` for a
 * flag whose next token is another flag (`--max-tokens --mode review`), and
 * `parseInt(true, 10)` is NaN — which would otherwise reach the API as an
 * opaque 400 instead of a message naming the flag the user got wrong.
 */
export function parseMaxTokens(raw) {
  if (raw === undefined) return DEFAULT_MAX_TOKENS;
  // Digits only: rejects the boolean `true`, negatives, decimals, "1e4", "8k".
  if (typeof raw !== "string" || !/^\d+$/.test(raw.trim())) return null;
  const value = parseInt(raw.trim(), 10);
  return value > 0 ? value : null;
}

/** The message both scripts print for a --max-tokens value parseMaxTokens rejected. */
export function maxTokensError(raw) {
  // `true` means the flag was given with no value of its own.
  const got = raw === true ? "no value given" : JSON.stringify(raw);
  return `Invalid --max-tokens: ${got}. Must be a positive integer, e.g. --max-tokens ${DEFAULT_MAX_TOKENS}.`;
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) {
        args[key] = argv[i + 1];
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}
