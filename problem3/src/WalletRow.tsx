import React from 'react';

export const WalletRow: React.FC<{
  amount: number;
  usdValue: number;
  formattedAmount: string;
  currency: string;
  blockchain: string;
}> = ({ amount, usdValue, formattedAmount, currency, blockchain }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between mb-3 hover:shadow-md transition">
      <div>
        <div className="font-semibold text-lg">
          {currency} <span className="text-sm text-gray-500">({blockchain})</span>
        </div>
        <div className="text-gray-500">Amount: {formattedAmount}</div>
      </div>
      <div className="text-right">
        <div className="text-green-600 font-bold">${usdValue.toFixed(2)}</div>
      </div>
    </div>
  );
};
