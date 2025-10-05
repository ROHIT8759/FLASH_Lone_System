import React, { useState, useRef, useEffect } from 'react';
import { useTrustScore } from '../../hooks/useElegentDeFi';
import { Toast } from '../Toast';

interface TrustScoreProps {
    userAddress?: string;
    className?: string;
}

export const TrustScorePanel: React.FC<TrustScoreProps> = ({ userAddress, className = '' }) => {
    const [lookupAddress, setLookupAddress] = useState('');
    const [newScore, setNewScore] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const { trustScore, fetchTrustScore, updateTrustScore, isLoading, error } = useTrustScore(userAddress);

    // Update progress bar width when trust score changes
    useEffect(() => {
        if (progressBarRef.current) {
            const width = ((trustScore - 300) / 550) * 100;
            progressBarRef.current.style.width = `${Math.max(0, Math.min(100, width))}%`;
        }
    }, [trustScore]); const handleLookupScore = async () => {
        if (!lookupAddress) {
            setToast({ message: 'Please enter an address to lookup', type: 'error' });
            return;
        }

        try {
            const score = await fetchTrustScore(lookupAddress);
            setToast({
                message: `Trust score for ${lookupAddress.slice(0, 6)}...${lookupAddress.slice(-4)}: ${score}`,
                type: 'success'
            });
        } catch (err: any) {
            setToast({
                message: `Failed to fetch trust score: ${err.message}`,
                type: 'error'
            });
        }
    };

    const handleUpdateScore = async () => {
        if (!userAddress || !newScore) {
            setToast({ message: 'Please connect wallet and enter new score', type: 'error' });
            return;
        }

        try {
            const result = await updateTrustScore(userAddress, parseInt(newScore));
            setToast({
                message: `Trust score updated successfully! Tx: ${result.transactionHash}`,
                type: 'success'
            });
            setNewScore('');
        } catch (err: any) {
            setToast({
                message: `Failed to update trust score: ${err.message}`,
                type: 'error'
            });
        }
    };

    const getTrustScoreColor = (score: number) => {
        if (score >= 800) return 'text-green-600 bg-green-50';
        if (score >= 700) return 'text-yellow-600 bg-yellow-50';
        if (score >= 600) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    const getTrustScoreLabel = (score: number) => {
        if (score >= 800) return 'Excellent';
        if (score >= 700) return 'Good';
        if (score >= 600) return 'Fair';
        return 'Poor';
    };

    const getTrustScoreBenefits = (score: number) => {
        if (score >= 800) {
            return [
                'Access to premium loan rates',
                'Higher borrowing limits',
                'Reduced collateral requirements',
                'Priority customer support'
            ];
        }
        if (score >= 700) {
            return [
                'Standard loan rates',
                'Normal borrowing limits',
                'Standard collateral requirements',
                'Regular customer support'
            ];
        }
        if (score >= 600) {
            return [
                'Higher interest rates',
                'Limited borrowing amounts',
                'Higher collateral requirements',
                'Basic customer support'
            ];
        }
        return [
            'Restricted access to loans',
            'Very limited borrowing',
            'Maximum collateral required',
            'Limited platform features'
        ];
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Trust Score</h2>
                <div className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                    Credit Rating System
                </div>
            </div>

            {/* User's Trust Score */}
            {userAddress && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Trust Score</h3>
                    <div className={`rounded-lg p-6 border-2 ${getTrustScoreColor(trustScore).replace('text-', 'border-').replace('-600', '-200')}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className={`text-4xl font-bold ${getTrustScoreColor(trustScore)}`}>
                                    {trustScore}
                                </div>
                                <div className={`text-lg font-medium ${getTrustScoreColor(trustScore)}`}>
                                    {getTrustScoreLabel(trustScore)}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-600">Score Range</div>
                                <div className="text-lg font-semibold text-gray-900">300 - 850</div>
                            </div>
                        </div>

                        {/* Trust Score Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>300</span>
                                <span>850</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    ref={progressBarRef}
                                    className={`h-2 rounded-full transition-all duration-300 ${getTrustScoreColor(trustScore).replace('text-', 'bg-').replace('bg-', 'bg-gradient-to-r from-').replace('-50', '').replace('-600', '-500 to-').concat('-600')}`}
                                ></div>
                            </div>
                        </div>                        {/* Benefits */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Your Benefits:</h4>
                            <ul className="space-y-1">
                                {getTrustScoreBenefits(trustScore).map((benefit, index) => (
                                    <li key={index} className="text-sm text-gray-600 flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lookup Trust Score */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Lookup Trust Score</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Wallet Address
                        </label>
                        <input
                            type="text"
                            value={lookupAddress}
                            onChange={(e) => setLookupAddress(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={handleLookupScore}
                        disabled={isLoading || !lookupAddress}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${isLoading || !lookupAddress
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                            }`}
                    >
                        {isLoading ? 'Looking up...' : 'Lookup Trust Score'}
                    </button>
                </div>

                {/* Update Trust Score (Admin only in real implementation) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Update Score</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Trust Score (Admin Only)
                        </label>
                        <input
                            type="number"
                            value={newScore}
                            onChange={(e) => setNewScore(e.target.value)}
                            placeholder="300-850"
                            min="300"
                            max="850"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-xs text-yellow-700">
                            ⚠️ This function is typically restricted to platform administrators and automated scoring systems.
                        </p>
                    </div>

                    <button
                        onClick={handleUpdateScore}
                        disabled={isLoading || !newScore || !userAddress}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${isLoading || !newScore || !userAddress
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                            }`}
                    >
                        {isLoading ? 'Updating...' : 'Update Score'}
                    </button>
                </div>
            </div>

            {/* Trust Score Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How Trust Scores Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">📊 Score Factors</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Payment history (35%)</li>
                            <li>• Loan utilization (30%)</li>
                            <li>• Account age (15%)</li>
                            <li>• Activity diversity (10%)</li>
                            <li>• Recent behavior (10%)</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">🎯 Score Ranges</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• 800-850: Excellent</li>
                            <li>• 700-799: Good</li>
                            <li>• 600-699: Fair</li>
                            <li>• 300-599: Poor</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">💡 Improve Your Score</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Make payments on time</li>
                            <li>• Keep utilization low</li>
                            <li>• Maintain active account</li>
                            <li>• Diversify activities</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">🔄 Updates</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Real-time calculation</li>
                            <li>• Daily score updates</li>
                            <li>• Blockchain verified</li>
                            <li>• Transparent algorithm</li>
                        </ul>
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