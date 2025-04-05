/**
 * @vitest-environment jsdom
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  RenderResult,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mock } from "vitest";
import { useConnect, useAccount, WagmiConfig } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { MetaMaskSignup } from "../MetaMaskSignup";
import { CoinbaseSignup } from "../CoinbaseSignup";
import { WalletConnectSignup } from "../WalletConnectSignup";

// Mock browser APIs
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockDispatchEvent = vi.fn();
const mockPostMessage = vi.fn();

// Mock document object
const mockDocument = {
  activeElement: null,
  hasFocus: () => false,
  createElement: (tag: string) => ({
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
    },
    hasAttribute: () => false,
    getAttribute: () => null,
    removeAttribute: vi.fn(),
    setAttribute: vi.fn(),
    style: {},
    nodeType: 1,
    nodeName: tag.toUpperCase(),
    tagName: tag.toUpperCase(),
    ownerDocument: document,
  }),
  createRange: () => ({
    setStart: vi.fn(),
    setEnd: vi.fn(),
    commonAncestorContainer: {
      nodeName: "BODY",
      ownerDocument: document,
    },
  }),
  body: {
    nodeType: 1,
    nodeName: "BODY",
    tagName: "BODY",
    ownerDocument: document,
  },
};

// Mock window object
const mockWindow = {
  addEventListener: mockAddEventListener,
  removeEventListener: mockRemoveEventListener,
  dispatchEvent: mockDispatchEvent,
  ethereum: undefined,
  location: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
  },
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  },
  sessionStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  },
  parent: window,
  top: window,
  postMessage: mockPostMessage,
  document: mockDocument,
};

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ alt = "", src, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} src={src} {...props} />;
  },
}));

// Mock wagmi hooks and config
vi.mock("wagmi", () => ({
  useConnect: vi.fn(),
  useAccount: vi.fn(),
  WagmiConfig: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock RainbowKit modal
vi.mock("@rainbow-me/rainbowkit", () => ({
  useConnectModal: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Test setup
interface TestContextType {
  render: (ui: React.ReactElement) => RenderResult;
  cleanup: () => void;
}

const createTestContext = (): TestContextType => {
  const context: TestContextType = {
    render: (ui: React.ReactElement) => {
      const result = render(<div data-testid="test-wrapper">{ui}</div>);
      return result;
    },
    cleanup: cleanup,
  };
  return context;
};

describe("Wallet Signup Components", () => {
  let testContext: TestContextType;
  let originalEthereum: any;

  beforeEach(() => {
    testContext = createTestContext();
    vi.clearAllMocks();
    originalEthereum = window.ethereum;

    // Default mock values for hooks
    (useConnect as Mock).mockReturnValue({
      connect: vi.fn(),
      connectors: [],
      error: null,
      status: "disconnected",
    });

    (useAccount as Mock).mockReturnValue({
      address: null,
      isConnected: false,
      status: "disconnected",
    });

    (useConnectModal as Mock).mockReturnValue({
      openConnectModal: vi.fn(),
      connectModalOpen: false,
    });
  });

  afterEach(() => {
    testContext.cleanup();
    vi.clearAllMocks();
    window.ethereum = originalEthereum;
  });

  describe("MetaMask Signup", () => {
    beforeEach(() => {
      (useConnect as Mock).mockReturnValue({
        connect: vi.fn(),
        connectors: [{ id: "metaMask" }],
        error: null,
        status: "disconnected",
      });
    });

    it("renders MetaMask signup button", () => {
      testContext.render(<MetaMaskSignup />);
      expect(
        screen.getByRole("button", { name: /continue with metamask/i }),
      ).toBeInTheDocument();
    });

    // it("handles MetaMask not installed", async () => {
    //   // Ensure window.ethereum is not defined
    //   window.ethereum = undefined;

    //   const mockConnect = vi.fn().mockRejectedValue(new Error("MetaMask not installed"));
    //   (useConnect as Mock).mockReturnValue({
    //     connect: mockConnect,
    //     connectors: [{ id: "metaMask" }],
    //     error: null,
    //     status: "disconnected",
    //   });

    //   testContext.render(<MetaMaskSignup />);
    //   const button = screen.getByRole("button", {
    //     name: /continue with metamask/i,
    //   });

    //   await fireEvent.click(button);

    //   await waitFor(() => {
    //     expect(mockConnect).toHaveBeenCalled();
    //   });

    //   await waitFor(() => {
    //     expect(toast.error).toHaveBeenCalledWith(
    //       "MetaMask is not installed. Please install MetaMask to continue",
    //       expect.any(Object),
    //     );
    //   });
    // });

    it("handles MetaMask connection error", async () => {
      (useConnect as Mock).mockReturnValue({
        connect: vi.fn(),
        connectors: [{ id: "metaMask" }],
        error: new Error("MetaMask not installed"),
        status: "disconnected",
      });

      testContext.render(<MetaMaskSignup />);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "MetaMask is not installed. Please install MetaMask to continue",
          expect.any(Object),
        );
      });
    });

    it("handles successful connection", async () => {
      const mockConnect = vi.fn().mockResolvedValue(undefined);
      (useConnect as Mock).mockReturnValue({
        connect: mockConnect,
        connectors: [{ id: "metaMask" }],
        error: null,
        status: "disconnected",
      });

      testContext.render(<MetaMaskSignup />);
      const button = screen.getByRole("button", {
        name: /continue with metamask/i,
      });

      await fireEvent.click(button);

      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled();
      });
    });
  });

  describe("Coinbase Signup", () => {
    beforeEach(() => {
      (useConnect as Mock).mockReturnValue({
        connect: vi.fn(),
        connectors: [{ id: "coinbaseWallet" }],
        error: null,
        status: "disconnected",
      });
    });

    it("renders Coinbase signup button", () => {
      testContext.render(<CoinbaseSignup />);
      expect(
        screen.getByRole("button", { name: /continue with coinbase wallet/i }),
      ).toBeInTheDocument();
    });

    it("handles Coinbase connection", async () => {
      const mockConnect = vi.fn().mockResolvedValue(undefined);
      (useConnect as Mock).mockReturnValue({
        connect: mockConnect,
        connectors: [{ id: "coinbaseWallet" }],
        error: null,
        status: "disconnected",
      });

      testContext.render(<CoinbaseSignup />);
      const button = screen.getByRole("button", {
        name: /continue with coinbase wallet/i,
      });
      await fireEvent.click(button);

      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled();
      });
    });

    // it("handles Coinbase connection error", async () => {
    //   const mockConnect = vi.fn().mockRejectedValue(new Error("Connection failed"));
    //   (useConnect as Mock).mockReturnValue({
    //     connect: mockConnect,
    //     connectors: [{ id: "coinbaseWallet" }],
    //     error: null,
    //     status: "disconnected",
    //   });

    //   testContext.render(<CoinbaseSignup />);
    //   const button = screen.getByRole("button", {
    //     name: /continue with coinbase wallet/i,
    //   });
    //   await fireEvent.click(button);

    //   await waitFor(() => {
    //     expect(mockConnect).toHaveBeenCalled();
    //   });

    //   await waitFor(() => {
    //     expect(toast.error).toHaveBeenCalledWith(
    //       "Failed to connect to Coinbase Wallet",
    //       expect.any(Object),
    //     );
    //   });
    // });
  });

  describe("WalletConnect Signup", () => {
    beforeEach(() => {
      (useConnect as Mock).mockReturnValue({
        connect: vi.fn(),
        connectors: [{ id: "walletConnect" }],
        error: null,
        status: "disconnected",
      });
    });

    it("renders WalletConnect signup button", () => {
      testContext.render(<WalletConnectSignup />);
      expect(
        screen.getByRole("button", { name: /continue with walletconnect/i }),
      ).toBeInTheDocument();
    });

    it("handles WalletConnect connection", async () => {
      const mockConnect = vi.fn().mockResolvedValue(undefined);
      (useConnect as Mock).mockReturnValue({
        connect: mockConnect,
        connectors: [{ id: "walletConnect" }],
        error: null,
        status: "disconnected",
      });

      testContext.render(<WalletConnectSignup />);
      const button = screen.getByRole("button", {
        name: /continue with walletconnect/i,
      });
      await fireEvent.click(button);

      await waitFor(() => {
        expect(mockConnect).toHaveBeenCalled();
      });
    });

    // it("handles WalletConnect connection error", async () => {
    //   const mockConnect = vi.fn().mockRejectedValue(new Error("Connection failed"));
    //   (useConnect as Mock).mockReturnValue({
    //     connect: mockConnect,
    //     connectors: [{ id: "walletConnect" }],
    //     error: null,
    //     status: "disconnected",
    //   });

    //   testContext.render(<WalletConnectSignup />);
    //   const button = screen.getByRole("button", {
    //     name: /continue with walletconnect/i,
    //   });
    //   await fireEvent.click(button);

    //   await waitFor(() => {
    //     expect(mockConnect).toHaveBeenCalled();
    //   });

    //   await waitFor(() => {
    //     expect(toast.error).toHaveBeenCalledWith(
    //       "Failed to connect with WalletConnect",
    //       expect.any(Object),
    //     );
    //   });
    // });
  });
});
