import { useWallet } from '@txnlab/use-wallet-react'
import type { Role, UserView, OrgView } from '../App'

interface Props {
  role: Role
  userView: UserView
  orgView: OrgView
  onUserViewChange: (v: UserView) => void
  onOrgViewChange: (v: OrgView) => void
  onRoleChange: () => void
}

export function Header({ role, userView, orgView, onUserViewChange, onOrgViewChange, onRoleChange }: Props) {
  const { wallets, activeAddress } = useWallet()
  const peraWallet = wallets[0]

  const handleWallet = async () => {
    if (activeAddress) {
      await peraWallet?.disconnect()
    } else {
      await peraWallet?.connect()
    }
  }

  const isOrg = role === 'org'
  const accentColor = isOrg ? 'indigo' : 'emerald'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo + role badge */}
          <button
            onClick={onRoleChange}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity"
            title="Switch role"
          >
            <span className="text-xl font-bold text-indigo-700">ConsentLedger</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isOrg
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isOrg ? '🏥 Org' : '👤 User'}
            </span>
          </button>

          {/* Nav tabs */}
          <nav className="flex gap-1 ml-3">
            {isOrg ? (
              <>
                {([
                  ['request', 'Request Access'],
                  ['granted', 'Granted to Me'],
                ] as [OrgView, string][]).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => onOrgViewChange(v)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      orgView === v
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </>
            ) : (
              <>
                {([
                  ['grant', 'Grant Consent'],
                  ['consents', 'My Tokens'],
                ] as [UserView, string][]).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => onUserViewChange(v)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      userView === v
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </>
            )}
          </nav>
        </div>

        <button
          onClick={handleWallet}
          className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            activeAddress
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : accentColor === 'indigo'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
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

