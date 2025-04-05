declare module "wagmi" {
  export const useAccount: any;
  export const useConnect: any;
  export const useDisconnect: any;
  export const useBalance: any;
  export const useConfig: any;
  export const useEnsName: any;
  export const WagmiProvider: any;
  export const createConfig: any;
  export const http: any;
  export const useSignMessage: any;
}

declare module "wagmi/chains" {
  export const base: any;
  export const mainnet: any;
  export const baseGoerli: any;
}

declare module "wagmi/actions" {
  export const switchNetwork: any;
}

declare module "@tanstack/react-query" {
  export const QueryClient: any;
  export const QueryClientProvider: any;
}
