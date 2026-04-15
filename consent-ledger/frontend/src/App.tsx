import React from 'react'
import { NetworkId, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { GrantConsentForm } from './components/GrantConsentForm'
import { ActiveConsents } from './components/ActiveConsents'
import { OrgConsents } from './components/OrgConsents'
import { Header } from './components/Header'
import { RolePicker } from './components/RolePicker'

const walletManager = new WalletManager({
  wallets: [WalletId.MNEMONIC],
  defaultNetwork: NetworkId.LOCALNET,
})

export type Role = 'user' | 'org'
export type UserView = 'grant' | 'consents'
export type OrgView = 'request' | 'granted'

function App() {
  const [role, setRole] = React.useState<Role | null>(null)
  const [userView, setUserView] = React.useState<UserView>('grant')
  const [orgView, setOrgView] = React.useState<OrgView>('request')

  return (
    <WalletProvider manager={walletManager}>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {!role ? (
          <RolePicker onSelect={setRole} />
        ) : (
          <>
            <Header
              role={role}
              userView={userView}
              orgView={orgView}
              onUserViewChange={setUserView}
              onOrgViewChange={setOrgView}
              onRoleChange={() => setRole(null)}
            />
            <main className="max-w-2xl mx-auto px-4 py-8">
              {role === 'user' && userView === 'grant' && <GrantConsentForm />}
              {role === 'user' && userView === 'consents' && <ActiveConsents />}
              {role === 'org' && <OrgConsents view={orgView} />}
            </main>
          </>
        )}
      </div>
    </WalletProvider>
  )
}

export default App
