// ─── ConsentLedger Frontend Config ───────────────────────────────────────────
// Update APP_ID and APP_ADDRESS after deploying to TestNet.
// Run: algokit project deploy testnet  →  note the printed app_id & app_address

export const CONFIG = {
  // TestNet app values (update after deploy)
  APP_ID: BigInt(import.meta.env.VITE_APP_ID ?? '0'),
  APP_ADDRESS: import.meta.env.VITE_APP_ADDRESS ?? '',

  // TestNet explorer base URL
  EXPLORER_TX_URL: 'https://testnet.explorer.perawallet.app/tx/',
} as const
