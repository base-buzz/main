import { Chain, getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { mainnet, base } from "wagmi/chains";
import { http } from "viem";

// Default configuration
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;
const appName = "BaseBuzz";

// Define chains with proper typing
const chains: readonly [Chain, ...Chain[]] = [
  {
    ...base,
    iconBackground: "#0052FF",
    iconUrl: "/icons/base.svg",
  },
  {
    ...mainnet,
    iconBackground: "#627EEA",
    iconUrl: "/icons/ethereum.svg",
  },
];

// Create the base configuration
const baseConfig = {
  appName,
  projectId,
  chains,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
};

// MetaMask-focused configuration
export const metaMaskConfig = getDefaultConfig({
  ...baseConfig,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet],
    },
    {
      groupName: "Other Options",
      wallets: [walletConnectWallet, injectedWallet],
    },
  ],
});

// Coinbase-focused configuration
export const coinbaseConfig = getDefaultConfig({
  ...baseConfig,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [coinbaseWallet],
    },
    {
      groupName: "Other Options",
      wallets: [walletConnectWallet, injectedWallet],
    },
  ],
});

// WalletConnect-focused configuration
export const walletConnectConfig = getDefaultConfig({
  ...baseConfig,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [walletConnectWallet],
    },
    {
      groupName: "Other Options",
      wallets: [metaMaskWallet, coinbaseWallet, injectedWallet],
    },
  ],
});

// Default configuration with all wallets
export const defaultConfig = getDefaultConfig({
  ...baseConfig,
  wallets: [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, coinbaseWallet, walletConnectWallet],
    },
    {
      groupName: "More",
      wallets: [rainbowWallet, injectedWallet],
    },
  ],
});
