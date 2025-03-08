"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggler";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
import { clusterApiUrl } from "@solana/web3.js";
import { motion } from "framer-motion";

function MainContent() {
  const router = useRouter();
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  return (
    <>
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold mr-6 gradient-text">TokenIt</h2>
          <WalletMultiButton className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300" />
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 max-w-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500">
            TokenIt.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Build your token with our simple and intuitive platform. No coding
            required.
          </p>

          {connected ? (
            <></>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <p className="text-lg text-muted-foreground mb-2">
                Connect your wallet to get started
              </p>
              <Button
                onClick={() => setVisible(true)}
                className="px-10 py-6 text-lg font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                Connect Wallet
              </Button>
            </motion.div>
          )}
        </motion.div>

        {connected && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {["Create Token Mint", "Make Liquidity Pool"].map((title, i) => (
              <div
                key={title}
                onClick={() => {
                  if (title === "Create Token Mint") {
                    router.push("/launchpad");
                  } else if (title === "Make Liquidity Pool") {
                    router.push("/liquidity");
                  }
                }}
                className="p-6 rounded-2xl cursor-pointer bg-gradient-to-br from-background to-muted/30 border border-muted/30 backdrop-blur-sm"
              >
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">
                  {title === "Create Token Mint" &&
                    "Create a token mint with customizable parameters"}
                  {title === "Make Liquidity Pool" &&
                    "Create a liquidity pool with customizable parameters"}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}

export default function Home() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <MainContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
