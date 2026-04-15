import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { ConsentLedgerClient } from '../contracts/ConsentLedgerClient'
import { CONFIG } from '../config'
import { decodeConsentRecord, consentBoxName, formatExpiry } from '../utils'
import type { ConsentRecord } from '../utils'

interface ConsentItem {
  assetId: bigint
  record: ConsentRecord
  frozen: boolean
  revoking: boolean
  revokeTxId?: string
}

export function ActiveConsents() {
  const { transactionSigner, activeAddress, wallets } = useWallet()
  const peraWallet = wallets[0]

  const [items, setItems] = useState<ConsentItem[]>([])
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
      const algorand = AlgorandClient.defaultLocalNet()
      const algod = algorand.client.algod

      // 1. Get all ASAs held by the wallet
      const acctInfo = await algod.accountInformation(activeAddress).do()
      const heldAssets = acctInfo.assets ?? []

      if (heldAssets.length === 0) { setItems([]); return }

      // 2. Filter to those created by the ConsentLedger app address
      const appAddr = CONFIG.APP_ADDRESS

      const results: ConsentItem[] = []
      for (const held of heldAssets) {
        const assetId = held.assetId
        // Fetch ASA info to check creator
        try {
          const assetInfo = await algod.getAssetByID(Number(assetId)).do()
          if (assetInfo.params.creator !== appAddr) continue
        } catch {
          continue
        }

        // Read box data
        const boxKey = consentBoxName(assetId)
        let record: ConsentRecord
        try {
          const boxResult = await algod
            .getApplicationBoxByName(Number(CONFIG.APP_ID), boxKey)
            .do()
          record = decodeConsentRecord(boxResult.value)
        } catch {
          continue // box not found — skip
        }

        results.push({
          assetId,
          record,
          frozen: held.isFrozen,
          revoking: false,
        })
      }
      setItems(results)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [activeAddress])

  useEffect(() => { load() }, [load])

  const handleRevoke = async (assetId: bigint) => {
    if (!activeAddress || !transactionSigner) {
      await peraWallet?.connect()
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.assetId === assetId ? { ...item, revoking: true } : item))
    )
    try {
      const algorand = AlgorandClient.defaultLocalNet()
      algorand.setSigner(activeAddress, transactionSigner)

      const client = algorand.client.getTypedAppClientById(ConsentLedgerClient, {
        appId: CONFIG.APP_ID,
        defaultSender: activeAddress,
      })

      // Build box reference key
      const boxKey = consentBoxName(assetId)

      const response = await client.send.revokeConsent({
        args: { assetId },
        extraFee: (1_000).microAlgo(),
        boxReferences: [{ appId: CONFIG.APP_ID, name: boxKey }],
        assetReferences: [assetId],
        accountReferences: [CONFIG.APP_ADDRESS],
      })

      setItems((prev) =>
        prev.map((item) =>
          item.assetId === assetId
            ? { ...item, frozen: true, revoking: false, revokeTxId: response.txIds[0] }
            : item
        )
      )
    } catch (err: unknown) {
      setItems((prev) =>
        prev.map((item) => (item.assetId === assetId ? { ...item, revoking: false } : item))
      )
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  if (!activeAddress) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-5xl mb-4">👤</div>
        <p className="text-lg font-semibold mb-2">Connect your wallet to view tokens</p>
        <p className="text-sm text-gray-400 mb-6">You are logged in as a <span className="font-medium text-emerald-600">User</span>. Connect your Pera wallet to see your consent tokens.</p>
        <button
          onClick={() => peraWallet?.connect()}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
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
          <h2 className="text-2xl font-bold">My Consent Tokens</h2>
          <p className="text-gray-500 text-sm">On-chain consent tokens held by your wallet on LocalNet</p>
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
        <div className="text-center py-12 text-gray-400">Loading consent tokens…</div>
      )}

      {!loading && items.length === 0 && !error && (
        <div className="text-center py-12 text-gray-400">
          No consent tokens found for this wallet.
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <ConsentCard key={item.assetId.toString()} item={item} onRevoke={handleRevoke} />
        ))}
      </div>
    </div>
  )
}

function ConsentCard({
  item,
  onRevoke,
}: {
  item: ConsentItem
  onRevoke: (id: bigint) => void
}) {
  const isRevoked = item.frozen

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm bg-white ${
        isRevoked ? 'border-gray-200 opacity-70' : 'border-indigo-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                isRevoked
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {isRevoked ? 'Revoked' : 'Active'}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Token #{item.assetId.toString()}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Granted to Organisation</p>
            <p className="font-mono text-xs text-gray-800 break-all">{item.record.requester}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">Data Type:</span>{' '}
              <span className="text-gray-800 font-semibold">{item.record.dataType}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">Expires:</span>{' '}
              <span className="text-gray-800">{formatExpiry(item.record.expiry)}</span>
            </div>
            <div className="col-span-2">
              <span className="font-medium text-gray-600">Purpose:</span>{' '}
              <span className="text-gray-800">{item.record.purpose}</span>
            </div>
          </div>

          {item.revokeTxId && (
            <p className="text-xs text-gray-400 mt-2">
              Revoked · TxID: <span className="font-mono">{item.revokeTxId.slice(0, 12)}…</span>
            </p>
          )}
        </div>

        {!isRevoked && (
          <button
            onClick={() => onRevoke(item.assetId)}
            disabled={item.revoking}
            className="shrink-0 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {item.revoking ? 'Revoking…' : 'Revoke'}
          </button>
        )}
      </div>
    </div>
  )
}
