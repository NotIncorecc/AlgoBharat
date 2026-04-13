import { useWallet } from '@txnlab/use-wallet-react'
import type { View } from '../App'

interface Props {
  view: View
  onViewChange: (v: View) => void
}

export function Header({ view, onViewChange }: Props) {
  const { wallets, activeAddress } = useWallet()
  const peraWallet = wallets[0]

  const handleWallet = async () => {
    if (activeAddress) {
      await peraWallet?.disconnect()
    } else {
      await peraWallet?.connect()
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-indigo-700">ConsentLedger</span>
          <nav className="flex gap-1 ml-4">
            {([
              ['grant', 'Grant Consent'],
              ['consents', 'My Consents'],
              ['org', 'Org View'],
            ] as [View, string][]).map(([v, label]) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === v
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={handleWallet}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            activeAddress
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {activeAddress
            ? `${activeAddress.slice(0, 6)}…${activeAddress.slice(-4)}`
            : 'Connect Pera Wallet'}
        </button>
      </div>
    </header>
  )
}
