import React, { useState } from 'react';
import { useFlashLoan } from '../../hooks/useElegentDeFi';
import { Toast } from '../Toast';

interface FlashLoanProps {
    className?: string;
}

export const FlashLoanPanel: React.FC<FlashLoanProps> = ({ className = '' }) => {
    const [amount, setAmount] = useState('');
    const [targetContract, setTargetContract] = useState('');
    const [params, setParams] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { executeFlashLoan, isLoading, error } = useFlashLoan();

    const handleExecuteFlashLoan = async () => {
        if (!amount || !targetContract) {
            setToast({ message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        try {
            const result = await executeFlashLoan(amount, targetContract, params);
            setToast({
                message: `Flash loan executed successfully! Tx: ${result.transactionHash}`,
                type: 'success'
            });

            // Reset form
            setAmount('');
            setTargetContract('');
            setParams('');
        } catch (err: any) {
            setToast({
                message: `Flash loan failed: ${err.message}`,
                type: 'error'
            });
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Flash Loans</h2>
                <div className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    Instant Liquidity
                </div>
            </div>

            <div className="space-y-4">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Amount (ETH) *
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="0.001"
                            min="0"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">ETH</span>
                        </div>
                    </div>
                </div>

                {/* Target Contract */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Contract Address *
                    </label>
                    <input
                        type="text"
                        value={targetContract}
                        onChange={(e) => setTargetContract(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Contract that will receive and handle the flash loan
                    </p>
                </div>

                {/* Parameters */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parameters (Optional)
                    </label>
                    <textarea
                        value={params}
                        onChange={(e) => setParams(e.target.value)}
                        placeholder="Additional parameters for the target contract..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Custom data to pass to your flash loan contract
                    </p>
                </div>

                {/* Flash Loan Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Flash Loan Requirements</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Loan must be repaid within the same transaction</li>
                        <li>• Your contract must implement proper flash loan logic</li>
                        <li>• Small fee (0.09%) will be charged on the loan amount</li>
                        <li>• Ensure your contract has sufficient ETH to repay + fee</li>
                    </ul>
                </div>

                {/* Execute Button */}
                <button
                    onClick={handleExecuteFlashLoan}
                    disabled={isLoading || !amount || !targetContract}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${isLoading || !amount || !targetContract
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                        }`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Executing Flash Loan...
                        </div>
                    ) : (
                        'Execute Flash Loan'
                    )}
                </button>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
            </div>

            {/* Flash Loan Examples */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Use Cases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Arbitrage Trading</h4>
                        <p className="text-sm text-gray-600">
                            Exploit price differences between exchanges without initial capital
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Debt Refinancing</h4>
                        <p className="text-sm text-gray-600">
                            Swap collateral or move positions between protocols
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Liquidation</h4>
                        <p className="text-sm text-gray-600">
                            Liquidate positions without holding the required tokens
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Complex DeFi</h4>
                        <p className="text-sm text-gray-600">
                            Execute multi-step strategies in a single transaction
                        </p>
                    </div>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};