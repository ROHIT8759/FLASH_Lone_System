import React, { useState, useEffect } from "react";
import {
  HandCoins,
  Handshake,
  ShieldAlert,
  Wallet,
  Banknote,
  Layers,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useContract } from "../../hooks/useContract";

interface TradeInterfaceProps {
  selectedAsset?: any;
}

const TradeInterface: React.FC<TradeInterfaceProps> = () => {
  // Contract integration
  const contract = useContract();

  // Form state
  const [tradeType, setTradeType] = useState<string>("borrow");
  const [amount, setAmount] = useState<string>("");
  const [duration, setDuration] = useState<string>("30");
  const [collateralType, setCollateralType] = useState<string>("eth");

  // Transaction state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Real-time data
  const [availableLiquidity, setAvailableLiquidity] = useState<string>("0");
  const [userBalance, setUserBalance] = useState<string>("0");

  // Load real-time data
  useEffect(() => {
    if (contract.contractData) {
      setAvailableLiquidity(contract.contractData.totalStaked);
    }
    if (contract.maxLoanAmount) {
      setUserBalance(contract.maxLoanAmount);
    }
  }, [contract.contractData, contract.maxLoanAmount]);

  const durations = [
    { value: "7", label: "7 days", apr: "6.5%" },
    { value: "30", label: "30 days", apr: "8.2%" },
    { value: "90", label: "90 days", apr: "9.5%" },
    { value: "180", label: "180 days", apr: "11.0%" },
  ];

  const collateralOptions = [
    {
      value: "eth",
      label: "ETH Token",
      ltv: "80%",
      icon: <Wallet className="w-5 h-5 text-blue-400" />,
    },
    {
      value: "nft",
      label: "NFT Collection",
      ltv: "60%",
      icon: <Layers className="w-5 h-5 text-pink-400" />,
    },
    {
      value: "lp",
      label: "LP Tokens",
      ltv: "70%",
      icon: <Banknote className="w-5 h-5 text-green-400" />,
    },
  ];

  const calculateInterest = () => {
    const principal = parseFloat(amount) || 0;
    const selectedDuration = durations.find(d => d.value === duration);
    const aprString = selectedDuration?.apr || "8.2%";
    const apr = parseFloat(aprString.replace('%', '')) / 100;
    const days = parseInt(duration);

    // Calculate simple interest for clarity
    return (principal * (apr / 100) * (days / 365)).toFixed(2);
  };

  const calculateTotal = () => {
    const principal = parseFloat(amount) || 0;
    const interest = parseFloat(calculateInterest()) || 0;
    return (principal + interest).toFixed(2);
  };

  const getMaxAmount = () => {
    if (tradeType === "borrow") {
      return Math.min(
        parseFloat(userBalance || "0"),
        parseFloat(availableLiquidity || "0") * 0.8 // 80% of available liquidity
      ).toFixed(2);
    }
    return userBalance || "0";
  };

  // Real transaction handlers
  const handleBorrow = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!contract.isConnected) {
        throw new Error("Please connect your wallet first");
      }

      if (parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (parseFloat(amount) > parseFloat(getMaxAmount())) {
        throw new Error(`Amount exceeds maximum of ${getMaxAmount()} ETH`);
      }

      // Use contract service to request loan
      const tokenAddress = "0x0000000000000000000000000000000000000000"; // ETH
      const tx = await contract.requestLoan(tokenAddress, amount);

      setTxHash(tx.hash);
      setSuccess(true);

      // Reset form
      setAmount("");

    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLend = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!contract.isConnected) {
        throw new Error("Please connect your wallet first");
      }

      if (parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      // Use contract service to stake (provide liquidity)
      const tx = await contract.stake(amount);

      setTxHash(tx.hash);
      setSuccess(true);

      // Reset form
      setAmount("");

    } catch (err: any) {
      setError(err.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (tradeType === "borrow") {
      await handleBorrow();
    } else {
      await handleLend();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-8 shadow-lg">
      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span className="text-red-300">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-300 hover:text-red-100"
          >
            ×
          </button>
        </div>
      )}

      {success && txHash && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div className="text-green-300">
            <div>Transaction successful!</div>
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-200 hover:text-green-100 underline flex items-center gap-1"
            >
              View on Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="ml-auto text-green-300 hover:text-green-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          {tradeType === "borrow" ? (
            <HandCoins className="w-5 h-5" />
          ) : (
            <Handshake className="w-5 h-5" />
          )}
          {tradeType === "borrow" ? "Borrowing" : "Lending"} Interface
        </h3>
        <div className="flex rounded-lg bg-white/10 p-1">
          {["borrow", "lend"].map((type) => (
            <button
              key={type}
              onClick={() => setTradeType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tradeType === type
                  ? type === "borrow"
                    ? "bg-blue-600 text-white"
                    : "bg-green-600 text-white"
                  : "text-white/60 hover:text-white"
                }`}
            >
              {type === "borrow" ? "Borrow" : "Lend"}
            </button>
          ))}
        </div>
      </div>

      {/* Available Liquidity Display */}
      <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="text-blue-300 text-sm mb-1">Available Liquidity</div>
        <div className="text-blue-100 text-xl font-bold">{availableLiquidity} ETH</div>
      </div>

      {/* Horizontal Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              {tradeType === "borrow" ? "Borrow Amount" : "Lend Amount"} (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                placeholder="0.00"
                max={getMaxAmount()}
                className="w-full px-4 py-3 border border-white/20 rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={() => setAmount(getMaxAmount())}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded"
              >
                MAX
              </button>
            </div>
            <div className="text-xs text-white/60 mt-1">
              Max: {getMaxAmount()} ETH
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Loan Duration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {durations.map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => setDuration(dur.value)}
                  className={`p-3 rounded-lg border text-left transition-all ${duration === dur.value
                      ? "border-blue-400 bg-white/10 text-white"
                      : "border-white/10 text-white/70 hover:border-white/20"
                    }`}
                >
                  <div className="font-medium">{dur.label}</div>
                  <div className="text-xs">{dur.apr} APR</div>
                </button>
              ))}
            </div>
          </div>

          {/* Collateral Type (only if borrowing) */}
          {tradeType === "borrow" && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Collateral Type
              </label>
              <div className="space-y-2">
                {collateralOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${collateralType === option.value
                        ? "border-blue-400 bg-white/10"
                        : "border-white/10 hover:border-white/20"
                      }`}
                  >
                    <input
                      type="radio"
                      name="collateral"
                      value={option.value}
                      checked={collateralType === option.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCollateralType(e.target.value)}
                      className="sr-only"
                    />
                    {option.icon}
                    <div>
                      <div className="font-medium text-white">
                        {option.label}
                      </div>
                      <div className="text-xs text-white/60">
                        Max LTV: {option.ltv}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex-1 space-y-6">
          {/* Loan Summary */}
          {amount && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-white mb-2">
                {tradeType === "borrow" ? "Loan Summary" : "Lending Summary"}
              </h4>
              <div className="text-sm text-white/80 space-y-1">
                <div className="flex justify-between">
                  <span>Principal:</span>
                  <span className="font-medium text-white">{amount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Interest:</span>
                  <span className="font-medium text-white">
                    {calculateInterest()} ETH
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <span className="font-semibold text-white">
                    Total {tradeType === "borrow" ? "Repayment" : "Return"}:
                  </span>
                  <span className="font-bold text-white">
                    {calculateTotal()} ETH
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!amount || !contract.isConnected || isLoading || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(getMaxAmount())}
            className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${!amount || !contract.isConnected || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(getMaxAmount())
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : tradeType === "borrow"
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : !contract.isConnected ? (
              "Connect Wallet First"
            ) : !amount ? (
              "Enter Amount"
            ) : parseFloat(amount) <= 0 ? (
              "Enter Valid Amount"
            ) : parseFloat(amount) > parseFloat(getMaxAmount()) ? (
              `Max ${getMaxAmount()} ETH`
            ) : (
              tradeType === "borrow" ? "Request Loan" : "Provide Liquidity"
            )}
          </button>

          {/* Risk Warning */}
          <div className="bg-yellow-100/10 border border-yellow-300/20 rounded-lg p-3">
            <div className="text-sm text-yellow-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>
                <strong>Risk Warning:</strong>{" "}
                {tradeType === "borrow"
                  ? "Failure to repay may result in collateral liquidation."
                  : "Lending involves smart contract risks and borrower default."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeInterface;
