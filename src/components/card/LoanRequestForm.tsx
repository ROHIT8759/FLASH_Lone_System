import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// Flash Loan Contract ABI
const FLASH_LOAN_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_poolAddress",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "profit",
        "type": "uint256"
      }
    ],
    "name": "ArbitrageProfit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "premium",
        "type": "uint256"
      }
    ],
    "name": "FlashLoanExecuted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "POOL",
    "outputs": [
      {
        "internalType": "contract IPool",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "premium",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "initiator",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      }
    ],
    "name": "executeOperation",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      }
    ],
    "name": "requestFlashLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Token addresses for different networks (update with actual addresses)
const TOKEN_ADDRESSES: { [key: string]: string } = {
  ETH: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Common ETH placeholder
  USDC: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC on Ethereum
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7"  // USDT on Ethereum
};

// Utility functions for validation
const isValidHexAddress = (address: string): boolean => {
  if (!address) return false;
  // Remove 0x prefix if present
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  // Check if it's a valid hex string with correct length (40 characters for Ethereum addresses)
  return /^[0-9a-fA-F]{40}$/.test(cleanAddress);
};

const formatAddress = (address: string): string => {
  if (!address) return '';
  // Ensure it starts with 0x
  const cleanAddress = address.startsWith('0x') ? address : `0x${address}`;
  return cleanAddress;
};

const isValidHexBytes = (data: string): boolean => {
  if (!data) return false;
  // Remove 0x prefix if present
  const cleanData = data.startsWith('0x') ? data.slice(2) : data;
  // Check if it's a valid hex string with even number of characters
  return /^[0-9a-fA-F]*$/.test(cleanData) && cleanData.length % 2 === 0;
};

const formatHexBytes = (data: string): string => {
  if (!data) return '0x';
  // Remove 0x prefix if present
  let cleanData = data.startsWith('0x') ? data.slice(2) : data;
  // Pad with leading zero if odd length
  if (cleanData.length % 2 !== 0) {
    cleanData = '0' + cleanData;
  }
  // Ensure it starts with 0x
  return '0x' + cleanData;
};

const validateAmount = (amount: string, maxAmount: string): { isValid: boolean; error?: string } => {
  const numAmount = parseFloat(amount);
  const numMaxAmount = parseFloat(maxAmount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: "Amount must be a positive number" };
  }
  
  if (numAmount > numMaxAmount) {
    return { isValid: false, error: `Amount cannot exceed ${maxAmount} ETH` };
  }
  
  return { isValid: true };
};

const LoanRequestForm: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [tokenType, setTokenType] = useState<string>("ETH");
  const [collateralAddress, setCollateralAddress] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [loanType, setLoanType] = useState<string>("standard"); // New state for loan type
  const [flashLoanData, setFlashLoanData] = useState<string>(""); // Flash loan execution data
  const contractAddress = "0xd2a5bC10698FD955D1Fe6cb468a17809A08fd005";
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isCreatingTrustScore, setIsCreatingTrustScore] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  const [userAddress, setUserAddress] = useState<string>("");
  const [isContractInitialized, setIsContractInitialized] = useState<boolean>(false);
  const [hasTrustScore, setHasTrustScore] = useState<boolean>(false);
  const [trustScoreData, setTrustScoreData] = useState<any>(null);
  const [maxLoanAmount, setMaxLoanAmount] = useState<string>("100");
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);

  // Check wallet connection and get user address
  useEffect(() => {
    const checkWallet = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setUserAddress(accounts[0]);
            setIsWalletConnected(true);
            await checkContractAndUserStatus(accounts[0]);
          }
        } else {
          setIsWalletConnected(false);
        }
      } catch (error) {
        console.log("Wallet not connected:", error);
        setIsWalletConnected(false);
      }
    };

    checkWallet();
  }, []);

  // Comprehensive status check with better error handling
  const checkContractAndUserStatus = async (address: string) => {
    try {
      // Validate address format
      if (!isValidHexAddress(address)) {
        console.error("Invalid address format:", address);
        return;
      }

      // Placeholder for EVM contract interaction
      // TODO: Implement actual smart contract calls
      console.log("Checking contract status for address:", address);
      
      // For now, simulate contract is initialized and user has trust score
      setIsContractInitialized(true);
      setHasTrustScore(true);
      setTrustScoreData({ score: 750 }); // Mock data
      setMaxLoanAmount("100"); // Default max loan amount
      
    } catch (error: any) {
      console.log("Error checking contract status:", error);
      setIsContractInitialized(false);
      setHasTrustScore(false);
      setMaxLoanAmount("100");
    }
  };

  // Initialize the contract with better error handling
  const initializeContract = async () => {
    setIsInitializing(true);
    setError(null);
    setTxHash(null);
    setValidationErrors({});

    try {
      if (!window.ethereum) throw new Error("Wallet not connected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.getSigner(); // Verify wallet connection
      
      // Placeholder for smart contract initialization
      // TODO: Replace with actual contract address and ABI
      console.log("Initializing contract...");
      
      // Mock transaction for demonstration
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 8);
      
      setIsContractInitialized(true);
      setTxHash(mockTxHash);
      
      // Refresh status
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await checkContractAndUserStatus(accounts[0]);
      }
      
    } catch (err: any) {
      console.error("Initialization error:", err);
      let errorMessage = "Initialization failed.";
      
      if (err.message) {
        if (err.message.includes("insufficient")) {
          errorMessage = "Insufficient balance to initialize contract.";
        } else if (err.message.includes("already initialized")) {
          errorMessage = "Contract is already initialized.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsInitializing(false);
    }
  };

  // Create trust score with better error handling
  const createTrustScore = async () => {
    setIsCreatingTrustScore(true);
    setError(null);
    setTxHash(null);
    setValidationErrors({});

    try {
      if (!window.ethereum) throw new Error("Wallet not connected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.getSigner(); // Verify wallet connection
      
      // Placeholder for smart contract interaction
      console.log("Creating trust score...");
      
      // Mock transaction for demonstration
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 8);

      setHasTrustScore(true);
      setTxHash(mockTxHash);
      
      // Refresh status
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await checkContractAndUserStatus(accounts[0]);
      }
      
    } catch (err: any) {
      console.error("Trust score creation error:", err);
      let errorMessage = "Trust score creation failed.";
      
      if (err.message) {
        if (err.message.includes("already exists")) {
          errorMessage = "Trust score already exists for this account.";
        } else if (err.message.includes("insufficient")) {
          errorMessage = "Insufficient balance to create trust score.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsCreatingTrustScore(false);
    }
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Validate amount
    const amountValidation = validateAmount(amount, maxLoanAmount);
    if (!amountValidation.isValid) {
      errors.amount = amountValidation.error!;
    }

    // For flash loans, skip collateral validation as it's not needed
    if (loanType === "standard") {
      // Validate collateral address if provided
      if (collateralAddress.trim()) {
        const formattedAddress = formatAddress(collateralAddress.trim());
        if (!isValidHexAddress(formattedAddress)) {
          errors.collateralAddress = "Invalid collateral address format. Must be a valid Ethereum address.";
        }
      }
    } else if (loanType === "flash") {
      // Validate flash loan data
      if (!flashLoanData.trim()) {
        errors.flashLoanData = "Flash loan execution data is required for flash loans.";
      }
    }

    // Validate purpose length
    if (purpose.length > 100) {
      errors.purpose = "Purpose description is too long (max 100 characters).";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit loan request with comprehensive validation
  const handleLoanRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setTxHash(null);
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (!window.ethereum) throw new Error("Wallet not connected");
      if (!isContractInitialized) throw new Error("Contract not initialized");
      if (!hasTrustScore) throw new Error("Trust score required");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.getSigner(); // Verify wallet connection
      
      // Convert amount to Wei (smallest unit of ETH)
      const amountInWei = ethers.parseEther(amount);
      
      // Format collateral address properly
      let collateralAddr = contractAddress; // default to contract address
      if (collateralAddress.trim()) {
        const formattedAddress = formatAddress(collateralAddress.trim());
        if (isValidHexAddress(formattedAddress)) {
          collateralAddr = formattedAddress;
        }
      }

      // Placeholder for smart contract interaction
      console.log("Loan request:", {
        amount: amountInWei.toString(),
        purpose: purpose || tokenType,
        collateral: collateralAddr
      });
      
      // Mock transaction for demonstration
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 8);

      setTxHash(mockTxHash);
      
      // Reset form
      setAmount("");
      setPurpose("");
      setCollateralAddress("");
      
      // Refresh user data
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await checkContractAndUserStatus(accounts[0]);
      }
      
    } catch (err: any) {
      console.error("Loan request error:", err);
      let errorMessage = "Loan request failed.";
      
      if (err.message) {
        if (err.message.includes("insufficient")) {
          errorMessage = "Insufficient balance to request loan.";
        } else if (err.message.includes("exceeds maximum")) {
          errorMessage = "Loan amount exceeds maximum allowed.";
        } else if (err.message.includes("invalid address")) {
          errorMessage = "Invalid collateral address provided.";
        } else if (err.message.includes("simulation failed")) {
          errorMessage = "Transaction simulation failed. Please check your inputs and try again.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle flash loan request
  const handleFlashLoanRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setTxHash(null);
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Additional validation for flash loans
    if (!flashLoanData.trim()) {
      setValidationErrors(prev => ({ 
        ...prev, 
        flashLoanData: "Flash loan execution data is required" 
      }));
      return;
    }

    // Validate hex bytes format
    if (!isValidHexBytes(flashLoanData)) {
      setValidationErrors(prev => ({ 
        ...prev, 
        flashLoanData: "Flash loan data must be valid hex bytes (even number of hex characters)" 
      }));
      return;
    }

    setIsLoading(true);

    try {
      if (!window.ethereum) throw new Error("Wallet not connected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Get contract instance
      const contract = new ethers.Contract(
        contractAddress, // Use your deployed contract address
        FLASH_LOAN_ABI,
        signer
      );

      // Get token address
      const tokenAddress = TOKEN_ADDRESSES[tokenType];
      if (!tokenAddress) throw new Error("Unsupported token type");

      // Convert amount to Wei (18 decimals for most tokens)
      const amountInWei = ethers.parseUnits(amount, 18);
      
      // Format and validate flashLoanData as proper hex bytes
      const params = formatHexBytes(flashLoanData);

      console.log("Flash loan request:", {
        tokenAddress,
        amount: amountInWei.toString(),
        params,
        purpose: purpose || "Flash loan operation"
      });

      // Send transaction to contract
      const tx = await contract.requestFlashLoan(tokenAddress, amountInWei, params);
      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      await tx.wait();
      
      // Reset form
      setAmount("");
      setPurpose("");
      setFlashLoanData("");
      
    } catch (err: any) {
      console.error("Flash loan request error:", err);
      let errorMessage = "Flash loan request failed.";
      
      if (err.message) {
        if (err.message.includes("insufficient")) {
          errorMessage = "Flash loan failed: insufficient liquidity in pool.";
        } else if (err.message.includes("execution failed")) {
          errorMessage = "Flash loan execution failed: ensure your data returns borrowed amount + fee.";
        } else if (err.message.includes("invalid data")) {
          errorMessage = "Invalid execution data provided.";
        } else if (err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user.";
        } else if (err.message.includes("gas")) {
          errorMessage = "Gas estimation failed. Please check your parameters.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle collateral address input with validation
  const handleCollateralAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCollateralAddress(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.collateralAddress) {
      setValidationErrors(prev => ({ ...prev, collateralAddress: "" }));
    }
  };

  // Handle amount input with validation
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // Clear validation error when user starts typing
    if (validationErrors.amount) {
      setValidationErrors(prev => ({ ...prev, amount: "" }));
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">🏦 Elegant DeFi Loan Platform</h2>
        <p className="text-white/70 text-sm">Decentralized lending with trust-based scoring</p>
      </div>
      
      {/* User Status Dashboard */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-3">📊 Account Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Wallet:</span>
            <span className={`font-mono text-xs ${isWalletConnected ? "text-green-400" : "text-red-400"}`}>
              {isWalletConnected ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : "Not connected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Contract:</span>
            <span className={`font-semibold ${isContractInitialized ? "text-green-400" : "text-red-400"}`}>
              {isContractInitialized ? "✅ Ready" : "❌ Not Initialized"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Trust Score:</span>
            <span className={`font-semibold ${hasTrustScore ? "text-green-400" : "text-yellow-400"}`}>
              {hasTrustScore ? `✅ ${trustScoreData ? trustScoreData[0] : 'Created'}` : "⚠️ Required"}
            </span>
          </div>
          {hasTrustScore && (
            <div className="flex justify-between">
              <span className="text-white/70">Max Loan:</span>
              <span className="text-blue-400 font-semibold">{maxLoanAmount} ETH</span>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: Initialize Contract */}
      {!isContractInitialized && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <h3 className="text-red-400 font-semibold mb-2">🚫 Contract Not Initialized</h3>
          <p className="text-red-300 text-sm mb-4">
            The smart contract needs to be initialized before any operations can be performed.
            This is typically done by the contract admin.
          </p>
          <button
            onClick={initializeContract}
            disabled={isInitializing || !isWalletConnected}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInitializing ? "Initializing..." : "Initialize Contract"}
          </button>
        </div>
      )}

      {/* Step 2: Create Trust Score */}
      {isContractInitialized && !hasTrustScore && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">📈 Create Your Trust Score</h3>
          <p className="text-yellow-300 text-sm mb-4">
            A trust score is required to participate in the lending platform. This creates your 
            on-chain credit profile and determines your borrowing capacity.
          </p>
          <button
            onClick={createTrustScore}
            disabled={isCreatingTrustScore || !isWalletConnected}
            className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingTrustScore ? "Creating..." : "Create Trust Score"}
          </button>
        </div>
      )}

      {/* Step 3: Loan Request Form */}
      {isContractInitialized && hasTrustScore && (
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">💰 Request a Loan</h3>
          
          {/* Loan Type Selector */}
          <div className="mb-6">
            <label className="block text-white/80 text-sm font-medium mb-3">
              Loan Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLoanType("standard")}
                className={`p-4 rounded-lg border transition-all ${
                  loanType === "standard"
                    ? "bg-blue-500/20 border-blue-400 text-blue-300"
                    : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏦</div>
                  <div className="font-semibold">Standard Loan</div>
                  <div className="text-xs mt-1">Requires collateral</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setLoanType("flash")}
                className={`p-4 rounded-lg border transition-all ${
                  loanType === "flash"
                    ? "bg-purple-500/20 border-purple-400 text-purple-300"
                    : "bg-white/5 border-white/20 text-white/70 hover:bg-white/10"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-semibold">Flash Loan</div>
                  <div className="text-xs mt-1">Single transaction</div>
                </div>
              </button>
            </div>
            <div className="mt-2 text-xs text-white/60">
              {loanType === "standard" 
                ? "Standard loans require collateral and have flexible repayment terms."
                : "Flash loans must be borrowed and repaid within the same transaction. No collateral required."}
            </div>
            
            {/* Flash Loan Information */}
            {loanType === "flash" && (
              <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h4 className="text-purple-300 font-semibold mb-2 flex items-center">
                  <span className="mr-2">⚡</span>
                  Flash Loan Features
                </h4>
                <ul className="text-purple-200 text-xs space-y-1">
                  <li>• <strong>No Collateral:</strong> Borrow without providing upfront collateral</li>
                  <li>• <strong>Single Transaction:</strong> Borrow, execute logic, and repay in one transaction</li>
                  <li>• <strong>Instant Liquidation:</strong> Transaction reverts if not repaid properly</li>
                  <li>• <strong>Use Cases:</strong> Arbitrage, liquidations, collateral swapping</li>
                  <li>• <strong>Fee:</strong> Small percentage (typically 0.05-0.1%) of borrowed amount</li>
                </ul>
              </div>
            )}
          </div>
          
          <form onSubmit={loanType === "flash" ? handleFlashLoanRequest : handleLoanRequest} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Loan Amount (ETH) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={maxLoanAmount}
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-white/50 focus:outline-none transition-colors ${
                  validationErrors.amount 
                    ? 'border-red-400 focus:border-red-400' 
                    : 'border-white/20 focus:border-blue-400'
                }`}
                value={amount}
                onChange={handleAmountChange}
                placeholder={`Enter amount (max: ${maxLoanAmount} ETH)`}
                required
              />
              {validationErrors.amount && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.amount}</p>
              )}
              {amount && !validationErrors.amount && (
                <div className="mt-1">
                  <p className="text-xs text-white/60">
                    = {Math.floor(parseFloat(amount) * 100000000).toLocaleString()} octas
                  </p>
                  {parseFloat(amount) <= parseFloat(maxLoanAmount) && parseFloat(amount) > 0 && (
                    <p className="text-green-400 text-xs flex items-center mt-1">
                      <span className="mr-1">✅</span>
                      Amount is within loan limit
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Token Type *
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:outline-none"
                value={tokenType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTokenType(e.target.value)}
                aria-label="Token Type Selection"
                required
              >
                <option value="ETH" className="text-black bg-white">ETH</option>
                <option value="USDC" className="text-black bg-white">USDC</option>
                <option value="USDT" className="text-black bg-white">USDT</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Purpose / Description
              </label>
              <input
                type="text"
                maxLength={100}
                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-white/50 focus:outline-none transition-colors ${
                  validationErrors.purpose 
                    ? 'border-red-400 focus:border-red-400' 
                    : 'border-white/20 focus:border-blue-400'
                }`}
                value={purpose}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPurpose(e.target.value)}
                placeholder={loanType === "flash" ? "Arbitrage, liquidation, etc." : "Business expansion, education, etc."}
              />
              {validationErrors.purpose && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.purpose}</p>
              )}
              <p className="text-xs text-white/50 mt-1">
                {purpose.length}/100 characters
              </p>
            </div>

            {/* Flash Loan Execution Data */}
            {loanType === "flash" && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Execution Data * ⚡
                </label>
                <textarea
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-white/50 focus:outline-none transition-colors font-mono text-xs ${
                    validationErrors.flashLoanData 
                      ? 'border-red-400 focus:border-red-400' 
                      : 'border-white/20 focus:border-purple-400'
                  }`}
                  value={flashLoanData}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFlashLoanData(e.target.value)}
                  placeholder="0x1234abcd... (hex bytes with even number of characters - encoded function call data)"
                  required
                />
                {validationErrors.flashLoanData && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.flashLoanData}</p>
                )}
                <div className="text-xs text-purple-300 mt-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                  <div className="font-semibold mb-1">⚠️ Flash Loan Requirements:</div>
                  <ul className="list-disc list-inside space-y-1 text-purple-200">
                    <li>Must repay borrowed amount + fee in same transaction</li>
                    <li>Execution data should contain your arbitrage/liquidation logic</li>
                    <li>Transaction will revert if not repaid properly</li>
                    <li>Typical fee: 0.05% - 0.1% of borrowed amount</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Collateral Address - Only for Standard Loans */}
            {loanType === "standard" && (
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Collateral Address (Optional)
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-white/50 focus:outline-none transition-colors font-mono text-xs ${
                    validationErrors.collateralAddress 
                      ? 'border-red-400 focus:border-red-400' 
                      : 'border-white/20 focus:border-blue-400'
                  }`}
                  value={collateralAddress}
                  onChange={handleCollateralAddressChange}
                  placeholder="0x... (leave empty for default)"
                />
                {validationErrors.collateralAddress && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.collateralAddress}</p>
                )}
                <p className="text-xs text-white/50 mt-1">
                  Address of collateral asset or NFT (optional)
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                isLoading || 
                !amount || 
                parseFloat(amount) <= 0 || 
                parseFloat(amount) > parseFloat(maxLoanAmount) ||
                !isWalletConnected ||
                !isContractInitialized ||
                (loanType === "standard" && !hasTrustScore) ||
                (loanType === "flash" && !flashLoanData.trim()) ||
                Object.keys(validationErrors).length > 0
              }
              className={`w-full px-6 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                loanType === "flash" 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              {isLoading ? 
                (loanType === "flash" ? "Executing Flash Loan..." : "Submitting Loan Request...") : 
               !isWalletConnected ? "Connect Wallet First" :
               !isContractInitialized ? "Initialize Contract First" :
               loanType === "standard" && !hasTrustScore ? "Create Trust Score First" :
               parseFloat(amount) > parseFloat(maxLoanAmount) ? `Max loan is ${maxLoanAmount} ETH` :
               loanType === "flash" && !flashLoanData.trim() ? "Enter execution data" :
               Object.keys(validationErrors).length > 0 ? "Please fix validation errors" :
               loanType === "flash" ? "⚡ Execute Flash Loan" : "Submit Loan Request"}
            </button>
          </form>
        </div>
      )}

      {/* Transaction Results */}
      {txHash && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-green-400 text-lg">✅</span>
            <span className="text-green-400 font-semibold">
              {txHash.startsWith("0xFL") ? "Flash Loan Executed Successfully!" : "Transaction Successful!"}
            </span>
          </div>
          <p className="text-green-300 text-sm">
            {txHash.startsWith("0xFL") ? (
              <>
                Flash loan completed in single transaction. View on Explorer:{" "}
                <a
                  className="underline hover:text-green-200 font-mono"
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txHash.slice(0, 12)}...{txHash.slice(-8)}
                </a>
              </>
            ) : (
              <>
                View on Explorer:{" "}
                <a
                  className="underline hover:text-green-200 font-mono"
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txHash.slice(0, 12)}...{txHash.slice(-8)}
                </a>
              </>
            )}
          </p>
          {txHash.startsWith("0xFL") && (
            <div className="mt-3 p-2 bg-purple-500/10 rounded border border-purple-500/20">
              <p className="text-purple-300 text-xs">
                ⚡ Flash loan was borrowed, executed, and repaid within this single transaction.
              </p>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-red-400 text-lg">❌</span>
            <span className="text-red-400 font-semibold">Error</span>
          </div>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default LoanRequestForm;