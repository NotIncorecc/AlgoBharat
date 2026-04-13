import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { ConsentLedgerClient } from '../contracts/ConsentLedgerClient'
import { CONFIG } from '../config'

const DATA_TYPES = ['KYC', 'Medical', 'Financial'] as const
type DataType = (typeof DATA_TYPES)[number]

interface FormState {
  organization: string
  dataType: DataType
  purpose: string
  expiry: string // date string "YYYY-MM-DD" or ""
}

interface TxResult {
  txId: string
  assetId: string
}

export function GrantConsentForm() {
  const { transactionSigner, activeAddress, wallets } = useWallet()
  const peraWallet = wallets[0]

  const [form, setForm] = useState<FormState>({
    organization: '',
    dataType: 'KYC',
    purpose: '',
    expiry: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TxResult | null>(null)

  const update = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    // Connect wallet if needed
    if (!activeAddress || !transactionSigner) {
      try {
        await peraWallet?.connect()
        return // re-submit required after connect
      } catch {
        setError('Wallet connection cancelled.')
        return
      }
    }

    if (!form.organization.trim()) { setError('Organization name is required.'); return }
    if (!form.purpose.trim())      { setError('Purpose is required.'); return }
    if (CONFIG.APP_ID === 0n)      { setError('APP_ID not configured — set VITE_APP_ID in .env'); return }

    const expiryTs = form.expiry
      ? BigInt(Math.floor(new Date(form.expiry).getTime() / 1000))
      : 0n

    setLoading(true)
    try {
      const algorand = AlgorandClient.testNet()
      algorand.setSigner(activeAddress, transactionSigner)

      const client = algorand.client.getTypedAppClientById(ConsentLedgerClient, {
        appId: CONFIG.APP_ID,
        defaultSender: activeAddress,
      })

      const response = await client.send.grantConsent({
        args: {
          requester: form.organization,    // org fills the requester field
          dataType: form.dataType,
          purpose: form.purpose,
          expiry: expiryTs,
        },
        extraFee: (3_000).microAlgo(),     // cover inner AssetConfig + box MBR
      })

      setResult({
        txId: response.txIds[0],
        assetId: response.return?.toString() ?? '?',
      })
      setForm({ organization: '', dataType: 'KYC', purpose: '', expiry: '' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Grant Consent</h2>
      <p className="text-gray-500 text-sm mb-6">
        Mints a consent token (ASA) on Algorand TestNet and records your consent on-chain.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name
          </label>
          <input
            type="text"
            value={form.organization}
            onChange={(e) => update('organization', e.target.value)}
            placeholder="e.g. Apollo Hospitals"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Data type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
          <select
            value={form.dataType}
            onChange={(e) => update('dataType', e.target.value as DataType)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DATA_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <input
            type="text"
            value={form.purpose}
            onChange={(e) => update('purpose', e.target.value)}
            placeholder="e.g. Annual health screening"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Expiry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            value={form.expiry}
            onChange={(e) => update('expiry', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          {loading
            ? 'Submitting…'
            : activeAddress
            ? 'Grant Consent'
            : 'Connect Wallet & Grant Consent'}
        </button>
      </form>

      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-green-800 mb-1">✓ Consent granted!</p>
          <p className="text-gray-600">
            Consent ASA ID:{' '}
            <span className="font-mono font-bold text-gray-900">{result.assetId}</span>
          </p>
          <p className="text-gray-600 mt-1">
            Transaction:{' '}
            <a
              href={`${CONFIG.EXPLORER_TX_URL}${result.txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-indigo-700 hover:underline break-all"
            >
              {result.txId}
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
