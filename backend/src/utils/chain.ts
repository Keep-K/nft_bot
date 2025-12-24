import { ethers } from 'ethers';

export function getProvider(rpcUrl: string) {
  return new ethers.JsonRpcProvider(rpcUrl);
}

export function getWallet(privateKey: string, rpcUrl: string) {
  const provider = getProvider(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

export async function ensureTxConfirmed(provider: ethers.JsonRpcProvider, txHash: string, minConf = 1) {
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) return { ok: false as const, reason: 'TX_NOT_FOUND' as const };
  if (receipt.status !== 1) return { ok: false as const, reason: 'TX_FAILED' as const };
  
  let confirmations: number;
  if (typeof receipt.confirmations === 'number') {
    confirmations = receipt.confirmations;
  } else if (typeof receipt.confirmations === 'function') {
    confirmations = await receipt.confirmations();
  } else {
    confirmations = 0;
  }
  
  if (confirmations < minConf) return { ok: false as const, reason: 'TX_NOT_CONFIRMED' as const };
  return { ok: true as const, receipt };
}
