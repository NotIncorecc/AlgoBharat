import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { CONFIG } from '../config'
import { decodeConsentRecord, formatExpiry } from '../utils'
import type { ConsentRecord } from '../utils'

// Extract the asset_id (uint64 big-endian) from a box name: "consent_" (8 bytes) + uint64 (8 bytes)
function assetIdFromBoxName(name: Uint8Array): bigint | null {
  if (name.length !== 16) return null
  const view = new DataView(name.buffer, name.byteOffset, name.byteLength)
  return view.getBigUint64(8, false)
}

interface GrantedConsent {
  assetId: bigint
  record: ConsentRecord
  revoked: boolean
}

export function OrgConsents() {
  const { activeAddress, wallets } = useWallet()
  const peraWallet = wallets[0]

  const [items, setItems] = useState<GrantedConsent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!activeAddress) return
    if (CONFIG.APP_ID === 0n) {
      setError('APP_ID not configured — set VITE_APP_ID in .env')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const algorand = AlgorandClient.testNet()
      const algod = algorand.client.algod
      const appId = Number(CONFIG.APP_ID)

      // Enumerate all boxes of the ConsentLedger app
      const boxesResp = await algod.getApplicationBoxes(appId).do()
      const boxes = boxesResp.boxes ?? []

      const matched: GrantedConsent[] = []
      for (const box of boxes) {
        const assetId = assetIdFromBoxName(box.name)
        if (assetId === null) continue

        // Fetch and decode the box value
        let record: ConsentRecord
        try {
          const boxData = await algod.getApplicationBoxByName(appId, box.name).do()
          record = decodeConsentRecord(boxData.value)
        } catch {
          continue
        }

        // Filter: only show consents where this wallet is the requester
        if (record.requester !== activeAddress) continue

        // Check revocation: app address holds the ASA; frozen = revoked
        let revoked = false
        try {
          const holding = await algod
            .accountAssetInformation(CONFIG.APP_ADDRESS, Number(assetId))
            .do()
          revoked = holding.assetHolding?.isFrozen ?? false
        } catch {
          // if app doesn't hold it, treat as unknown
        }

        matched.push({ assetId, record, revoked })
      }

      setItems(matched)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [activeAddress])

  useEffect(() => { load() }, [load])

  if (!activeAddress) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg mb-4">
          Connect your organisation's Pera Wallet to view consents granted to you.
        </p>
        <button
          onClick={() => peraWallet?.connect()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
        >
          Connect Pera Wallet
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Consents Granted to You</h2>
          <p className="text-gray-500 text-sm">
            Data access consents where your address is the requester
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
        >
          {loading ? 'Loading…' : '↻ Refresh'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading && items.length === 0 && (
        <div className="text-center py-12 text-gray-400">Scanning on-chain consent records…</div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="text-center py-12 text-gray-400">
          No active consents found for your address.
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <OrgConsentCard key={item.assetId.toString()} item={item} />
        ))}
      </div>
    </div>
  )
}

function OrgConsentCard({ item }: { item: GrantedConsent }) {
  const { record, revoked } = item

  return (
    <div className={`rounded-xl border p-5 shadow-sm bg-white ${revoked ? 'border-gray-200 opacity-70' : 'border-indigo-100'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${revoked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {revoked ? 'Revoked' : 'Active'}
          </span>
          <span className="text-xs text-gray-400 font-mono">ASA {item.assetId.toString()}</span>
        </div>

        <p className="text-xs text-gray-500 mb-3 break-all">
          <span className="font-medium text-gray-700">Owner (data subject):</span>{' '}
          <span className="font-mono">{record.owner}</span>
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="font-medium text-gray-700">Data Type:</span>{' '}
            <span className="text-gray-600">{record.dataType}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Expires:</span>{' '}
            <span className="text-gray-600">{formatExpiry(record.expiry)}</span>
          </div>
          <div className="col-span-2">
            <span className="font-medium text-gray-700">Purpose:</span>{' '}
            <span className="text-gray-600">{record.purpose}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
