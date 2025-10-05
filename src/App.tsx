import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import axios from "axios";

import ErrorBoundary from "./components/ErrorBoundary";
import NavBar from "./components/NavBar";
import LandingNavbar from "./components/landing/Navbar";
import HeroSection from "./components/landing/HeroSection";
import Features from "./components/landing/Features";
import CTASection from "./components/landing/CTASection";
import Reputation from "./components/landing/Reputation";
import Footer from "./components/landing/Footer";
import BuiltOnEthereum from "./components/landing/BuiltOnEthereum";

// Contract Integration
import { useContract } from "./hooks/useContract";

// Advanced Dashboard
import { AdvancedDashboard } from "./components/advanced/AdvancedDashboard";

// Lazy load heavy components for better performance
import {
  LazyProfileDashboard,
  LazyPersonalDetails,
  LazyTransaction,
  LazyFilters,
  LazyCoinCard,
  LazyAssetTable,
  LazySummaryHeader,
  LazyTradeInterface,
  LazySmallLoanCard,
  LazyBigLoanCard,
  LazyLoanRequestForm,
  LazyLoanEligibilityMeter,
  LazyWalletConnectionModal,
  LazyFaucetModule,
  LazyLoanManagement,
} from "./lazyComponents";

import {
  clearSavedWalletConnection,
} from "./components/wallet/walletConfig";

// Types
interface SparklineData {
  price: number[];
}

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply?: number | null;
  sparkline_in_7d?: SparklineData;
}

// Constants
const COIN_LIST = [
  "bitcoin",
  "ethereum",
  "uniswap",
  "aave",
  "curve-dao-token",
  "chainlink",
  "litecoin",
  "maker",
  "compound-governance-token",
  "the-graph",
  "optimism",
  "arbitrum",
  "avalanche-2",
  "solana",
  "toncoin"
].join(",");

const API_ENDPOINTS = {
  MAINNET: "https://mainnet.infura.io/v3/",
  TESTNET: "https://sepolia.infura.io/v3/",
  COINGECKO: "https://api.coingecko.com/api/v3/coins/markets"
} as const;

const REQUEST_TIMEOUT = 10000;

function App() {
  // Contract Integration
  const contract = useContract();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<"landing" | "dashboard" | "marketplace" | "cards" | "contract" | "advanced">("landing");

  // Wallet State - Now using contract state as primary source
  const [walletType, setWalletType] = useState<string>("");
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const [useTestnet, setUseTestnet] = useState<boolean>(false);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);

  // Coin Data State
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [isLoadingCoins, setIsLoadingCoins] = useState<boolean>(false);
  const [coinsError, setCoinsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"rank" | "volume">("rank");
  const [chartRange, setChartRange] = useState<"7d" | "24h" | "1h">("7d");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // UI State
  const [showBorrowPopup, setShowBorrowPopup] = useState<boolean>(false);

  // Utility Functions
  const createAbortController = useCallback(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    return { controller, timeout };
  }, []);

  const handleApiError = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unknown error occurred";
  }, []);

  // Wallet integration now handled by contract hook
  const walletData = useMemo(() => ({
    address: contract.userAddress,
    ethBalance: 1.5, // Placeholder for now
    type: walletType,
    connectedAt,
    isLoading: contract.isLoading,
    error: contract.error,
  }), [contract.userAddress, contract.isLoading, contract.error, walletType, connectedAt]);

  // Coin Data Fetching
  const fetchCoinsData = useCallback(async (): Promise<void> => {
    setIsLoadingCoins(true);
    setCoinsError(null);

    const { controller, timeout } = createAbortController();

    try {
      const { data }: { data: Coin[] } = await axios.get(API_ENDPOINTS.COINGECKO, {
        params: {
          vs_currency: "usd",
          ids: COIN_LIST,
          order: "market_cap_desc",
          sparkline: true,
          price_change_percentage: "1h,24h,7d",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);
      setCoins(data);
      setFilteredCoins(data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setCoinsError(errorMessage);
      setCoins([]);
      setFilteredCoins([]);
    } finally {
      clearTimeout(timeout);
      setIsLoadingCoins(false);
    }
  }, [createAbortController, handleApiError]);

  // Event Handlers - Updated to use contract
  const handleWalletConnect = useCallback(
    async (): Promise<void> => {
      try {
        await contract.connectWallet();
        setWalletType("MetaMask");
        setConnectedAt(new Date().toISOString());
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
      setShowWalletModal(false);
    },
    [contract]
  );

  const handleWalletDisconnect = useCallback((): void => {
    setWalletType("");
    setConnectedAt(null);
    clearSavedWalletConnection();
    // Note: Contract disconnect would need to be implemented if needed
  }, []);

  const handleToggleNetwork = useCallback((): void => {
    setUseTestnet((prev) => !prev);
    // Network switching logic would go here
  }, []);

  const handleNavigationChange = useCallback((page: string): void => {
    const validPages = ["landing", "dashboard", "marketplace", "cards", "contract"] as const;
    if (validPages.includes(page as any)) {
      setCurrentPage(page as typeof validPages[number]);
    }
  }, []);

  const handleTrade = useCallback((coin: Coin, isBuy: boolean): void => {
    // Set the trade type and open the borrowing modal with the selected asset
    setShowBorrowPopup(true);
    // You could extend this to pre-select the trade type or pass coin data
    console.log(`Initiating ${isBuy ? "Buy" : "Sell"} for ${coin.name}`);
  }, []);

  // Effects - Removed wallet connection loading since contract handles it
  useEffect(() => {
    const dataRequiredPages = ["marketplace", "dashboard", "cards", "contract"];
    if (dataRequiredPages.includes(currentPage)) {
      fetchCoinsData();
    }
  }, [currentPage, fetchCoinsData]);

  useEffect(() => {
    let filteredResult = [...coins];

    // Apply search filter
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase().trim();
      filteredResult = filteredResult.filter(
        (coin) =>
          coin.name.toLowerCase().includes(lowercaseSearch) ||
          coin.symbol.toLowerCase().includes(lowercaseSearch)
      );
    }

    // Apply sorting
    filteredResult.sort((a, b) => {
      if (sortBy === "volume") {
        return b.total_volume - a.total_volume;
      }
      return a.market_cap_rank - b.market_cap_rank;
    });

    setFilteredCoins(filteredResult);
  }, [searchTerm, sortBy, coins]);

  // Memoized Values - Using contract data
  const marketStats = useMemo(() => {
    const marketSize = filteredCoins.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
    const totalBorrowed = filteredCoins.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);

    return {
      marketSize,
      totalBorrowed,
      lentOut: marketSize > 0 ? ((totalBorrowed / marketSize) * 100).toFixed(2) : "0",
    };
  }, [filteredCoins]);

  // Sample Data
  const sampleLoans = useMemo(() => ({
    bigLoan: {
      id: "001",
      amount: "$5,000",
      interestRate: "8.5%",
      term: "12 months",
      monthlyPayment: "$456",
      nextPayment: "Jul 15, 2025",
      remainingBalance: "$4,200",
      status: "Active",
    },
    smallLoans: [
      {
        id: 2,
        amount: "$500",
        interest: "4%",
        dueDate: "Aug 20, 2025",
        status: "Active",
      },
      {
        id: 3,
        amount: "$1,000",
        interest: "3%",
        dueDate: "June 25, 2025",
        status: "Pending",
      },
      {
        id: 4,
        amount: "$750",
        interest: "5%",
        dueDate: "Sep 10, 2025",
        status: "Pending",
      },
      {
        id: 5,
        amount: "$300",
        interest: "2%",
        dueDate: "Oct 5, 2025",
        status: "Active",
      },
    ],
  }), []);

  // Loading Components
  const LoadingSpinner = useMemo(() => ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) => {
    const sizeClasses = {
      sm: "h-5 w-5",
      md: "h-6 w-6",
      lg: "h-8 w-8"
    };

    return (
      <div className={`animate-spin rounded-full border-b-2 border-white ${sizeClasses[size]} ${className}`} />
    );
  }, []);

  const LoadingFallback = useMemo(() => ({ size = "md" }: { minHeight?: string; size?: "sm" | "md" | "lg" }) => (
    <div className="flex items-center justify-center min-h-[150px]">
      <LoadingSpinner size={size} />
    </div>
  ), [LoadingSpinner]);

  // Render logic
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <div className="min-h-screen w-full text-white">
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/5 border border-white/10 rounded-lg p-6 shadow-lg mt-20">
                <div className="lg:col-span-2 space-y-6">
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingFallback minHeight="300px" />}>
                      <LazyProfileDashboard
                        walletAddress={contract.userAddress}
                        ethBalance={walletData.ethBalance}
                      />
                    </Suspense>
                  </ErrorBoundary>
                  <Suspense fallback={<LoadingFallback minHeight="200px" />}>
                    <LazyPersonalDetails {...walletData} />
                  </Suspense>
                </div>
                {/* <BalanceOverview {...walletData} /> */}
                <Suspense fallback={<LoadingFallback minHeight="200px" />}>
                  <LazyTransaction />
                </Suspense>
              </div>
            </div>
          </div>
        );
      case "marketplace":
        return (
          <div className="pt-10 max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {/* Contract Status */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${contract.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-white font-medium">
                      Contract Status: {contract.isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {contract.contractData && (
                    <div className="text-white/70 text-sm">
                      Total Staked: {contract.contractData.totalStaked} ETH
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Header */}
              <Suspense fallback={<LoadingFallback minHeight="100px" />}>
                <LazySummaryHeader {...marketStats} />
              </Suspense>

              {/* Filters */}
              <div>
                <Suspense fallback={<LoadingFallback minHeight="80px" size="sm" />}>
                  <LazyFilters
                    {...{
                      searchTerm,
                      setSearchTerm,
                      sortBy,
                      setSortBy,
                      chartRange,
                      setChartRange,
                    }}
                  />
                </Suspense>
              </div>

              {/* Toggle & Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setViewMode(viewMode === "cards" ? "table" : "cards")
                    }
                    className="bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 rounded text-white flex items-center gap-2"
                  >
                    <span>📊</span>
                    {viewMode === "cards" ? "Table View" : "Card View"}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBorrowPopup(true)}
                    className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded text-white font-semibold flex items-center gap-2"
                  >
                    <span>💰</span>
                    Borrow / Lend
                  </button>
                  <button
                    onClick={() => setCurrentPage("contract")}
                    className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded text-white flex items-center gap-2"
                  >
                    <span>🔗</span>
                    Smart Contract
                  </button>
                </div>
              </div>

              {/* Coin Grid / Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingCoins ? (
                  <div className="col-span-full text-center py-10 text-lg text-gray-400">
                    Loading coins...
                  </div>
                ) : coinsError ? (
                  <div className="col-span-full text-center text-red-500">
                    {coinsError}
                  </div>
                ) : viewMode === "cards" ? (
                  <Suspense fallback={<LoadingFallback minHeight="200px" />}>
                    {filteredCoins.map((coin) => (
                      <LazyCoinCard
                        key={coin.id}
                        coin={coin}
                        chartRange={chartRange}
                        onTrade={handleTrade}
                      />
                    ))}
                  </Suspense>
                ) : (
                  <div className="col-span-full">
                    <Suspense fallback={<LoadingFallback minHeight="200px" />}>
                      <LazyAssetTable coins={filteredCoins} onTrade={handleTrade} />
                    </Suspense>
                  </div>
                )}
              </div>

              {/* Borrow Modal */}
              {showBorrowPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="relative w-full max-w-6xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl  shadow-2xl overflow-auto max-h-[90vh]">
                    {/* Close Button */}
                    <button
                      onClick={() => setShowBorrowPopup(false)}
                      className="absolute top-1 right-3 text-white text-2xl hover:text-gray-400 z-50"
                    >
                      ✕
                    </button>

                    {/* Trade Interface (wide version) */}
                    <Suspense fallback={<LoadingFallback minHeight="150px" />}>
                      <LazyTradeInterface />
                    </Suspense>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "cards":
        return (
          <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto text-white space-y-12">
            <div className="text-center space-y-2 mt-20">
              <h1 className="p-2 text-3xl md:text-5xl font-bold bg-gradient-to-r from-fuchsia-400 via-blue-400 to-teal-300 bg-clip-text text-transparent drop-shadow-md opacity-90">
                Loan Management
              </h1>
              <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto">
                Manage your active loans, request new ones, and track your
                eligibility.
              </p>
            </div>
            <div className="flex gap-10 w-screen">
              <div className="w-3/6 flex flex-col gap-10 border border-white/10 py-10 px-4 rounded-2xl">
                <Suspense fallback={<LoadingFallback minHeight="150px" />}>
                  <LazyLoanRequestForm />
                </Suspense>
                <div className="border w-full border-white/50"></div>
                <Suspense fallback={<LoadingFallback minHeight="200px" />}>
                  <LazyBigLoanCard loan={sampleLoans.bigLoan} />
                </Suspense>
                <div className="border w-full border-white/50"></div>
                <div className="grid grid-cols-2 gap-2">
                  <Suspense fallback={<LoadingFallback minHeight="100px" size="sm" />}>
                    {sampleLoans.smallLoans.map((loan) => (
                      <LazySmallLoanCard key={loan.id} loan={loan} />
                    ))}
                  </Suspense>
                </div>
              </div>
              <div className="w-2/6">
                <Suspense fallback={<LoadingFallback minHeight="150px" />}>
                  <LazyLoanEligibilityMeter score={75} />
                </Suspense>
              </div>
            </div>
          </section>
        );
      case "contract":
        return (
          <div className="min-h-screen w-full text-white">
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
              <div className="text-center space-y-2 mt-20">
                <h1 className="p-2 text-3xl md:text-5xl font-bold bg-gradient-to-r from-fuchsia-400 via-blue-400 to-teal-300 bg-clip-text text-transparent drop-shadow-md opacity-90">
                  Smart Contract Interaction
                </h1>
                <p className="text-white/70 text-base md:text-lg max-w-xl mx-auto">
                  Interact directly with the DeFi lending smart contract.
                </p>
              </div>
              <Suspense fallback={<LoadingFallback minHeight="400px" />}>
                <LazyLoanManagement />
              </Suspense>
            </div>
          </div>
        );
      case "advanced":
        return (
          <div className="min-h-screen">
            <AdvancedDashboard userAddress={contract.userAddress} />
          </div>
        );
      default:
        return (
          <div className="bg-black text-white font-sans relative">
            <main className="overflow-x-hidden">
              <HeroSection
                onNavigateToApp={() => setCurrentPage("marketplace")}
              />
              <div className="bg-grid">
                <Features />
                <Reputation />
                <Suspense fallback={<LoadingFallback minHeight="150px" />}>
                  <LazyFaucetModule />
                </Suspense>
                <Suspense fallback={<LoadingFallback minHeight="150px" />}>
                  <BuiltOnEthereum />
                </Suspense>
                <CTASection
                  onNavigateToApp={() => setCurrentPage("marketplace")}
                />
              </div>
            </main>
            <Footer />
          </div>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div
        className={`min-h-screen ${["landing", "cards", "dashboard", "marketplace"].includes(currentPage)
          ? "bg-black text-white"
          : ""
          }`}
      >
        <div className="relative z-20">
          {currentPage === "landing" ? (
            <LandingNavbar
              onWalletConnect={() => setShowWalletModal(true)}
              onWalletDisconnect={handleWalletDisconnect}
              walletAddress={contract.userAddress}
            />
          ) : (
            <NavBar
              currentPage={currentPage}
              setCurrentPage={handleNavigationChange}
              walletAddress={contract.userAddress}
              onWalletConnect={handleWalletConnect}
              onShowWalletModal={() => setShowWalletModal(true)}
              useTestnet={useTestnet}
              onToggleNetwork={handleToggleNetwork}
            />
          )}
        </div>
        <main className="relative z-10">{renderPage()}</main>
        {showWalletModal && (
          <Suspense fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <LazyWalletConnectionModal
              isOpen={showWalletModal}
              onClose={() => setShowWalletModal(false)}
              onWalletConnect={handleWalletConnect}
              isLandingPage={currentPage === "landing"}
            />
          </Suspense>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
