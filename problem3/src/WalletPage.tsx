import React, { useMemo } from 'react';
import { WalletRow } from './WalletRow';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

const PRIORITY_MAP: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
const getPriority = (b: string) => PRIORITY_MAP[b] ?? -99;

export const useWalletBalances = (): WalletBalance[] => [
  { currency: 'ETH', amount: 1.234, blockchain: 'Ethereum' },
  { currency: 'OSMO', amount: 50, blockchain: 'Osmosis' },
  { currency: 'ARB', amount: 120, blockchain: 'Arbitrum' },
  { currency: 'NEO', amount: 0, blockchain: 'Neo' },
];

export const usePrices = (): Record<string, number> => ({
  ETH: 1800,
  OSMO: 0.8,
  ARB: 1.2,
  NEO: 10,
});

const WalletPage: React.FC = () => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances: FormattedWalletBalance[] = useMemo(() => {
    return balances
      .filter((b) => getPriority(b.blockchain) > -99 && b.amount > 0)
      .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain))
      .map((b) => {
        const usdValue = (prices[b.currency] ?? 0) * b.amount;
        return { ...b, formatted: b.amount.toFixed(2), usdValue };
      });
  }, [balances, prices]);

  return (
    <div>
      {formattedBalances.map((balance) => (
        <WalletRow key={balance.currency} currency={balance.currency} blockchain={balance.blockchain} amount={balance.amount} formattedAmount={balance.formatted} usdValue={balance.usdValue} />
      ))}
    </div>
  );
};

export default WalletPage;
