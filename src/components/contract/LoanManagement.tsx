import React, { useState, useCallback } from 'react';
import { useContract } from '../../hooks/useContract';

interface LoanManagementProps {
    className?: string;
}

const LoanManagement: React.FC<LoanManagementProps> = ({ className = '' }) => {
    const contract = useContract();
    const [loanAmount, setLoanAmount] = useState('');
    const [tokenAddress] = useState('0x0000000000000000000000000000000000000000'); // ETH placeholder
    const [stakeAmount, setStakeAmount] = useState('');
    const [loanIdToRepay, setLoanIdToRepay] = useState('');
    const [repayAmount, setRepayAmount] = useState('');

    const handleRequestLoan = useCallback(async () => {
        if (!loanAmount || !contract.isConnected) return;

        try {
            await contract.requestLoan(tokenAddress, loanAmount, loanAmount); // Using same amount for ETH value
            setLoanAmount('');
            alert('Loan requested successfully!');
        } catch (error) {
            console.error('Failed to request loan:', error);
            alert('Failed to request loan: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }, [contract, loanAmount, tokenAddress]);

    const handleRepayLoan = useCallback(async () => {
        if (!loanIdToRepay || !repayAmount || !contract.isConnected) return;

        try {
            await contract.repayLoan(parseInt(loanIdToRepay), repayAmount);
            setLoanIdToRepay('');
            setRepayAmount('');
            alert('Loan repaid successfully!');
        } catch (error) {
            console.error('Failed to repay loan:', error);
            alert('Failed to repay loan: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }, [contract, loanIdToRepay, repayAmount]);

    const handleStake = useCallback(async () => {
        if (!stakeAmount || !contract.isConnected) return;

        try {
            await contract.stake(stakeAmount);
            setStakeAmount('');
            alert('Staked successfully!');
        } catch (error) {
            console.error('Failed to stake:', error);
            alert('Failed to stake: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }, [contract, stakeAmount]);

    const handleUnstake = useCallback(async () => {
        if (!stakeAmount || !contract.isConnected) return;

        try {
            await contract.unstake(stakeAmount);
            setStakeAmount('');
            alert('Unstaked successfully!');
        } catch (error) {
            console.error('Failed to unstake:', error);
            alert('Failed to unstake: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }, [contract, stakeAmount]);

    const handleCreateTrustScore = useCallback(async () => {
        if (!contract.isConnected) return;

        try {
            await contract.createTrustScore();
            alert('Trust score created successfully!');
        } catch (error) {
            console.error('Failed to create trust score:', error);
            alert('Failed to create trust score: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    }, [contract]);

    if (!contract.isConnected) {
        return (
            <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
                <h2 className="text-2xl font-bold text-white mb-4">Contract Interaction</h2>
                <p className="text-gray-400">Please connect your wallet to interact with the smart contract.</p>
                <button
                    onClick={contract.connectWallet}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    disabled={contract.isLoading}
                >
                    {contract.isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
            </div>
        );
    }

    return (
        <div className={`bg-gray-900 rounded-lg p-6 space-y-6 ${className}`}>
            <h2 className="text-2xl font-bold text-white mb-4">Contract Interaction Dashboard</h2>

            {contract.error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
                    <p>{contract.error}</p>
                    <button
                        onClick={contract.clearError}
                        className="mt-2 text-sm text-red-300 hover:text-red-100 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Contract Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-1">Total Loans</h3>
                    <p className="text-xl font-bold text-white">{contract.contractData?.totalLoans || 'N/A'}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-1">Total Staked</h3>
                    <p className="text-xl font-bold text-white">{contract.contractData?.totalStaked || 'N/A'} ETH</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-1">Your Max Loan</h3>
                    <p className="text-xl font-bold text-white">{contract.maxLoanAmount} ETH</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm text-gray-400 mb-1">Your Loans</h3>
                    <p className="text-xl font-bold text-white">{contract.userLoans.length}</p>
                </div>
            </div>

            {/* User Stake Info */}
            {contract.userStake && (
                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Your Stake</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-400">Amount</p>
                            <p className="text-white font-semibold">{contract.userStake.amount} ETH</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Rewards</p>
                            <p className="text-white font-semibold">{contract.userStake.rewards} ETH</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Pending Rewards</p>
                            <p className="text-white font-semibold">{contract.pendingRewards} ETH</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Loan Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Loan Management</h3>

                    {/* Request Loan */}
                    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                        <h4 className="text-white font-medium">Request Loan</h4>
                        <input
                            type="number"
                            placeholder="Loan amount (ETH)"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            step="0.01"
                            min="0"
                        />
                        <button
                            onClick={handleRequestLoan}
                            disabled={!loanAmount || contract.isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 rounded transition-colors"
                        >
                            {contract.isLoading ? 'Processing...' : 'Request Loan'}
                        </button>
                    </div>

                    {/* Repay Loan */}
                    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                        <h4 className="text-white font-medium">Repay Loan</h4>
                        <input
                            type="number"
                            placeholder="Loan ID"
                            value={loanIdToRepay}
                            onChange={(e) => setLoanIdToRepay(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            min="0"
                        />
                        <input
                            type="number"
                            placeholder="Repay amount (ETH)"
                            value={repayAmount}
                            onChange={(e) => setRepayAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            step="0.01"
                            min="0"
                        />
                        <button
                            onClick={handleRepayLoan}
                            disabled={!loanIdToRepay || !repayAmount || contract.isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded transition-colors"
                        >
                            {contract.isLoading ? 'Processing...' : 'Repay Loan'}
                        </button>
                    </div>
                </div>

                {/* Staking Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Staking</h3>

                    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                        <h4 className="text-white font-medium">Stake/Unstake</h4>
                        <input
                            type="number"
                            placeholder="Amount (ETH)"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                            step="0.01"
                            min="0"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleStake}
                                disabled={!stakeAmount || contract.isLoading}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 rounded transition-colors"
                            >
                                Stake
                            </button>
                            <button
                                onClick={handleUnstake}
                                disabled={!stakeAmount || contract.isLoading}
                                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white py-2 rounded transition-colors"
                            >
                                Unstake
                            </button>
                        </div>
                    </div>

                    {/* Trust Score */}
                    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                        <h4 className="text-white font-medium">Trust Score</h4>
                        <button
                            onClick={handleCreateTrustScore}
                            disabled={contract.isLoading}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white py-2 rounded transition-colors"
                        >
                            {contract.isLoading ? 'Processing...' : 'Create Trust Score NFT'}
                        </button>
                    </div>
                </div>
            </div>

            {/* User Loans List */}
            {contract.userLoans.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Your Active Loans</h3>
                    <div className="space-y-2">
                        {contract.userLoans.map((loanId: string, index: number) => (
                            <div key={index} className="flex justify-between items-center bg-gray-700 rounded p-3">
                                <span className="text-white">Loan ID: {loanId}</span>
                                <button
                                    onClick={() => setLoanIdToRepay(loanId)}
                                    className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    Select for Repay
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanManagement;