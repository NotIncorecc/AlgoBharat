import React from 'react'
import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { GrantConsentForm } from './components/GrantConsentForm'
import { ActiveConsents } from './components/ActiveConsents'
import { Header } from './components/Header'

const walletManager = new WalletManager({
  wallets: [WalletId.PERA],
  defaultNetwork: NetworkId.TESTNET,
})

type View = 'grant' | 'consents'

function App() {
  const [view, setView] = React.useState<View>('grant')

  return (
    <WalletProvider manager={walletManager}>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Header view={view} onViewChange={setView} />
        <main className="max-w-2xl mx-auto px-4 py-8">
          {view === 'grant' ? <GrantConsentForm /> : <ActiveConsents />}
        </main>
      </div>
    </WalletProvider>
  )
}

export default App
