import type { ComponentProps } from 'react'
import { useEffect, useState } from 'react'

import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  useConnection,
} from '@solana/wallet-adapter-react'

import {
  WalletModalProvider,
  WalletMultiButton,
  WalletDisconnectButton,
} from '@solana/wallet-adapter-react-ui'

import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'

const endpoint = clusterApiUrl('devnet')

const wallets: ComponentProps<typeof WalletProvider>['wallets'] = []

function App() {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>

          <Topbar />

          <Portfolio />

        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

function Topbar() {
  const { publicKey } = useWallet();
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      {!publicKey && <WalletMultiButton />}
      {publicKey && <WalletDisconnectButton />}
    </div>
  );
}

function Portfolio() {
  const { publicKey } = useWallet();
  return publicKey ? <WalletBalance key={publicKey.toBase58()} /> : <p>Connect your wallet to view your devnet SOL balance.</p>;
}

function WalletBalance() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<null | number>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (publicKey) {
      connection
        .getBalance(publicKey)
        .then((b) => {
          if (active) setBalance(b);
        })
        .catch(() => {
          if (active) setError('Unable to load your devnet balance. Please refresh to try again.');
        });
    }
    return () => { active = false; };
  }, [publicKey, connection]);

  return (
    <div>
      {publicKey?.toString()} <br />
      {error ? <p role="alert">{error}</p> : <p>Devnet SOL Balance - {balance === null ? 'Loading…' : balance / 1_000_000_000}</p>}
    </div>
  );
}

export default App;
