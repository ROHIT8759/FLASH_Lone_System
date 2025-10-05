import React, { useState } from 'react';
import { FlashLoanPanel } from '../flashloan/FlashLoanPanel';
import { StakingPanel } from '../staking/StakingPanel';
import { TrustScorePanel } from '../trustscore/TrustScorePanel';
import LoanDashboard from '../card/LoanDashboard';
import { usePlatformStats } from '../../hooks/useElegentDeFi';

interface AdvancedDashboardProps {
    userAddress?: string;
    className?: string;
}

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ userAddress, className = '' }) => {
    const [activeTab, setActiveTab] = useState<'loans' | 'staking' | 'flashloan' | 'trustscore' | 'analytics'>('loans');
    const { stats, isLoading: statsLoading } = usePlatformStats();

    const tabs = [
        { id: 'loans', label: 'Loans', icon: '💰' },
        { id: 'staking', label: 'Staking', icon: '🔒' },
        { id: 'flashloan', label: 'Flash Loans', icon: '⚡' },
        { id: 'trustscore', label: 'Trust Score', icon: '📊' },
        { id: 'analytics', label: 'Analytics', icon: '📈' }
    ] as const;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'loans':
                return <LoanDashboard />;
            case 'staking':
                return <StakingPanel userAddress={userAddress} />;
            case 'flashloan':
                return <FlashLoanPanel />;
            case 'trustscore':
                return <TrustScorePanel userAddress={userAddress} />;
            case 'analytics':
                return <AnalyticsPanel stats={stats} isLoading={statsLoading} />;
            default:
                return <LoanDashboard />;
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">ElegentDeFi Platform</h1>
                            <p className="text-gray-600">Advanced DeFi lending and flash loan platform</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {userAddress && (
                                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                                </div>
                            )}
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Network: Ethereum
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Stats Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.totalLoans}</div>
                            <div className="text-sm opacity-80">Total Loans</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{parseFloat(stats.totalStaked).toFixed(2)} ETH</div>
                            <div className="text-sm opacity-80">Total Staked</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{parseFloat(stats.platformBalance).toFixed(2)} ETH</div>
                            <div className="text-sm opacity-80">Platform Balance</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">99.9%</div>
                            <div className="text-sm opacity-80">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderTabContent()}
            </div>
        </div>
    );
};

// Analytics Panel Component
interface AnalyticsPanelProps {
    stats: any;
    isLoading: boolean;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ stats, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Analytics</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-600 mb-2">Total Value Locked</h3>
                        <p className="text-2xl font-bold text-blue-800">
                            {(parseFloat(stats.totalStaked) + parseFloat(stats.platformBalance)).toFixed(2)} ETH
                        </p>
                        <p className="text-xs text-blue-600 mt-1">+5.2% from last week</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-green-600 mb-2">Active Loans</h3>
                        <p className="text-2xl font-bold text-green-800">{stats.totalLoans}</p>
                        <p className="text-xs text-green-600 mt-1">+12 new this week</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-purple-600 mb-2">Flash Loans</h3>
                        <p className="text-2xl font-bold text-purple-800">1,247</p>
                        <p className="text-xs text-purple-600 mt-1">+8.1% volume increase</p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-orange-600 mb-2">Average APY</h3>
                        <p className="text-2xl font-bold text-orange-800">12.5%</p>
                        <p className="text-xs text-orange-600 mt-1">Competitive rates</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Platform Activity</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-600 p-2 rounded-full mr-3">⚡</div>
                            <div>
                                <p className="font-medium text-gray-900">Flash Loan Executed</p>
                                <p className="text-sm text-gray-600">2.5 ETH flash loan for arbitrage</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">2 mins ago</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-green-100 text-green-600 p-2 rounded-full mr-3">💰</div>
                            <div>
                                <p className="font-medium text-gray-900">Loan Repaid</p>
                                <p className="text-sm text-gray-600">1.2 ETH loan repaid with interest</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">5 mins ago</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-purple-100 text-purple-600 p-2 rounded-full mr-3">🔒</div>
                            <div>
                                <p className="font-medium text-gray-900">New Stake</p>
                                <p className="text-sm text-gray-600">5.0 ETH staked for rewards</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">12 mins ago</div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                            <div className="bg-orange-100 text-orange-600 p-2 rounded-full mr-3">📊</div>
                            <div>
                                <p className="font-medium text-gray-900">Trust Score Updated</p>
                                <p className="text-sm text-gray-600">User score increased to 785</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">18 mins ago</div>
                    </div>
                </div>
            </div>

            {/* Protocol Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Health</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Collateralization Ratio</span>
                            <span className="font-semibold text-green-600">175%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Liquidation Risk</span>
                            <span className="font-semibold text-green-600">Low</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Platform Fee</span>
                            <span className="font-semibold text-gray-900">0.5%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Flash Loan Fee</span>
                            <span className="font-semibold text-gray-900">0.09%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Info</h3>
                    <div className="space-y-4">
                        <div>
                            <span className="text-gray-600 block">Contract Address</span>
                            <span className="font-mono text-sm text-gray-900">{stats.contractAddress}</span>
                        </div>
                        <div>
                            <span className="text-gray-600 block">Network</span>
                            <span className="font-semibold text-gray-900">Ethereum Mainnet</span>
                        </div>
                        <div>
                            <span className="text-gray-600 block">Version</span>
                            <span className="font-semibold text-gray-900">v2.0.0</span>
                        </div>
                        <div>
                            <span className="text-gray-600 block">Last Updated</span>
                            <span className="font-semibold text-gray-900">2024-01-15</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};