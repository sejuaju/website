import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

export const injected = new InjectedConnector({
  supportedChainIds: [97,56, 137, 250],
});

export const bscWalletConnect = new WalletConnectConnector({
  // rpc: { 97: "https://data-seed-prebsc-1-s1.binance.org:8545" },
  rpc: { 56: "https://rpc.ankr.com/bsc" },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 12000
});

export const walletConnect = new WalletConnectConnector({
  infuraId: '8b67e15820b844d0895178f86292f604', 
  rpc: { 56: 'https://mainnet.infura.io/v3/8b67e15820b844d0895178f86292f604' },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  qrcodeModalOptions: {
    mobileLinks: [
      "rainbow",
      "metamask",
      "argent",
      "trust",
      "imtoken",
      "pillar",
    ],
  },
  pollingInterval: 12000
})

export const maticWalletConnect = new WalletConnectConnector({
  rpc: { 137: "https://polygon-rpc.com/" },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 12000
});

export const ftmWalletConnect = new WalletConnectConnector({
  rpc: { 250: "https://rpcapi.fantom.network/" },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 12000
});