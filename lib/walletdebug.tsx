"use client";

import { useAccount, useBalance, useEnsName } from "wagmi";

export default function WalletDebug() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address: address ?? undefined });
  const { data: ensName } = useEnsName({ address: address ?? undefined });

  return (
    <div className="rounded-md border p-4">
      <h2 className="text-lg font-semibold">Wallet Debug Info</h2>
      {isConnected && address ? (
        <ul className="mt-2 text-sm">
          <li>
            <strong>Address:</strong> {address}
          </li>
          <li>
            <strong>ENS Name:</strong> {ensName || "N/A"}
          </li>
          <li>
            <strong>Balance:</strong> {balance?.formatted ?? "N/A"}{" "}
            {balance?.symbol ?? ""}
          </li>
          <li>
            <strong>Network:</strong> {chain?.name ?? "Unknown"} (ID:{" "}
            {chain?.id ?? "N/A"})
          </li>
        </ul>
      ) : (
        <p className="text-red-500">No wallet connected</p>
      )}
    </div>
  );
}
