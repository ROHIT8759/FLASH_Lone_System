import React, { useState } from 'react';
import { useStaking } from '../../hooks/useElegentDeFi';
import { Toast } from '../Toast';

interface StakingPanelProps {
    userAddress?: string;
    className?: string;
}

export const StakingPanel: React.FC<StakingPanelProps> = ({ userAddress, className = '' }) => {
    const [stakeAmount, setStakeAmount] = useState('');
    const [unstakeAmount, setUnstakeAmount] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { stakingInfo, stake, unstake, claimRewards, isLoading, error } = useStaking(userAddress);

    const handleStake = async () => {
        if (!stakeAmount) {
            setToast({ message: 'Please enter a stake amount', type: 'error' });
            return;
        }

        try {
            const result = await stake(stakeAmount);
            setToast({
                message: `Successfully staked ${stakeAmount} ETH! Tx: ${result.transactionHash}`,
                type: 'success'
            });
            setStakeAmount('');
        } catch (err: any) {
            setToast({
                message: `Staking failed: ${err.message}`,
                type: 'error'
            });
        }
    };

    const handleUnstake = async () => {
        if (!unstakeAmount) {
            setToast({ message: 'Please enter an unstake amount', type: 'error' });
            return;
        }

        try {
            const result = await unstake(unstakeAmount);
            setToast({
                message: `Successfully unstaked ${unstakeAmount} ETH! Tx: ${result.transactionHash}`,
                type: 'success'
            });
            setUnstakeAmount('');
        } catch (err: any) {
            setToast({
                message: `Unstaking failed: ${err.message}`,
                type: 'error'
            });
        }
    };

    const handleClaimRewards = async () => {
        try {
            const result = await claimRewards();
            setToast({
                message: `Successfully claimed rewards! Tx: ${result.transactionHash}`,
                type: 'success'
            });
        } catch (err: any) {
            setToast({
                message: `Claiming rewards failed: ${err.message}`,
                type: 'error'
            });
        }
    };

    const formatDate = (timestamp: number) => {
        if (timestamp === 0) return 'Never';
        return new Date(timestamp * 1000).toLocaleDateString();
    };

    const calculateAPY = () => {
        // Simple APY calculation - in real implementation, this would be more complex
        return '12.5%';
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Staking</h2>
                <div className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    APY: {calculateAPY()}
                </div>
            </div>

            {/* Staking Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Staked Amount</h3>
                    <p className="text-2xl font-bold text-blue-600">{stakingInfo.stakedAmount} ETH</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Rewards Earned</h3>
                    <p className="text-2xl font-bold text-green-600">{stakingInfo.rewardsEarned} ETH</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Last Stake</h3>
                    <p className="text-lg font-semibold text-purple-600">{formatDate(stakingInfo.lastStakeTime)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stake Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Stake ETH</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount to Stake
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                step="0.01"
                                min="0"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">ETH</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">💰 Staking Benefits</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• Earn passive income on your ETH</li>
                            <li>• Compound rewards automatically</li>
                            <li>• Help secure the platform</li>
                            <li>• Participate in governance</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleStake}
                        disabled={isLoading || !stakeAmount}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${isLoading || !stakeAmount
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                            }`}
                    >
                        {isLoading ? 'Staking...' : 'Stake ETH'}
                    </button>
                </div>

                {/* Unstake Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Unstake ETH</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount to Unstake
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={unstakeAmount}
                                onChange={(e) => setUnstakeAmount(e.target.value)}
                                placeholder="0.0"
                                max={stakingInfo.stakedAmount}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                step="0.01"
                                min="0"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">ETH</span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Available: {stakingInfo.stakedAmount} ETH
                        </p>
                    </div>

                    <button
                        onClick={() => setUnstakeAmount(stakingInfo.stakedAmount)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Max Unstake
                    </button>

                    <button
                        onClick={handleUnstake}
                        disabled={isLoading || !unstakeAmount || parseFloat(unstakeAmount) > parseFloat(stakingInfo.stakedAmount)}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${isLoading || !unstakeAmount || parseFloat(unstakeAmount) > parseFloat(stakingInfo.stakedAmount)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                            }`}
                    >
                        {isLoading ? 'Unstaking...' : 'Unstake ETH'}
                    </button>
                </div>
            </div>

            {/* Claim Rewards Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Claim Rewards</h3>
                        <p className="text-sm text-gray-600">
                            You have {stakingInfo.rewardsEarned} ETH in unclaimed rewards
                        </p>
                    </div>
                    <button
                        onClick={handleClaimRewards}
                        disabled={isLoading || parseFloat(stakingInfo.rewardsEarned) === 0}
                        className={`py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${isLoading || parseFloat(stakingInfo.rewardsEarned) === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                            }`}
                    >
                        {isLoading ? 'Claiming...' : 'Claim Rewards'}
                    </button>
                </div>
            </div>

            {/* Staking Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How Staking Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">🔒 Lock Period</h4>
                        <p className="text-sm text-gray-600">
                            No minimum lock period. Unstake anytime with instant withdrawal.
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">💎 Rewards</h4>
                        <p className="text-sm text-gray-600">
                            Earn rewards from platform fees and governance tokens.
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">🗳️ Governance</h4>
                        <p className="text-sm text-gray-600">
                            Staked ETH grants voting power in platform governance.
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">⚡ Compound</h4>
                        <p className="text-sm text-gray-600">
                            Rewards automatically compound to maximize returns.
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

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