/**
 * Decode an ARC-4 encoded ConsentRecord from box storage.
 *
 * Layout (head-tail ABI encoding):
 *   0..31   owner      arc4.Address (32 bytes static)
 *  32..63   requester  arc4.Address (32 bytes static)
 *  64..65   data_type  offset pointer (uint16, big-endian)
 *  66..67   purpose    offset pointer (uint16, big-endian)
 *  68..75   expiry     uint64 (big-endian)
 *  76..83   asset_id   uint64 (big-endian)
 *   tail    arc4.String = uint16 length + UTF-8 bytes
 */
export interface ConsentRecord {
  owner: string       // base32 Algorand address
  requester: string
  dataType: string
  purpose: string
  expiry: bigint      // 0 = no expiry; otherwise Unix timestamp
  assetId: bigint
}

import algosdk from 'algosdk'

export function decodeConsentRecord(data: Uint8Array): ConsentRecord {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength)

  const ownerBytes   = data.slice(0, 32)
  const reqBytes     = data.slice(32, 64)
  const dtOffset     = view.getUint16(64, false)
  const purpOffset   = view.getUint16(66, false)
  const expiry       = view.getBigUint64(68, false)
  const assetId      = view.getBigUint64(76, false)

  const dtLen        = view.getUint16(dtOffset, false)
  const dataType     = new TextDecoder().decode(data.slice(dtOffset + 2, dtOffset + 2 + dtLen))

  const purpLen      = view.getUint16(purpOffset, false)
  const purpose      = new TextDecoder().decode(data.slice(purpOffset + 2, purpOffset + 2 + purpLen))

  return {
    owner:     algosdk.encodeAddress(ownerBytes),
    requester: algosdk.encodeAddress(reqBytes),
    dataType,
    purpose,
    expiry,
    assetId,
  }
}

/**
 * Build the box name for a consent record: b"consent_" + asset_id as 8-byte big-endian.
 */
export function consentBoxName(assetId: bigint): Uint8Array {
  const prefix = new TextEncoder().encode('consent_')
  const key    = new Uint8Array(8)
  const view   = new DataView(key.buffer)
  view.setBigUint64(0, assetId, false)
  return new Uint8Array([...prefix, ...key])
}

/**
 * Format a Unix timestamp (seconds) as a human-readable date, or "No expiry" if 0.
 */
export function formatExpiry(ts: bigint): string {
  if (ts === 0n) return 'No expiry'
  return new Date(Number(ts) * 1000).toLocaleDateString()
}

/**
 * Shorten an Algorand address for display.
 */
export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
