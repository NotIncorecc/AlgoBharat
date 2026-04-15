// ─── ConsentLedger Frontend Config ───────────────────────────────────────────
// Update APP_ID and APP_ADDRESS after deploying.
// Run: algokit project deploy localnet  →  note the printed app_id & app_address

export const CONFIG = {
  APP_ID: BigInt(import.meta.env.VITE_APP_ID ?? '0'),
  APP_ADDRESS: import.meta.env.VITE_APP_ADDRESS ?? '',
} as const
