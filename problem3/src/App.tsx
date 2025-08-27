import React from 'react';
import WalletPage from './WalletPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Wallet Balances</h1>
      <div className="max-w-xl mx-auto">
        <WalletPage />
      </div>
    </div>
  );
};

export default App;
