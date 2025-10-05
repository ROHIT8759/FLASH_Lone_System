import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const formatAmount = (wei: string): string => {
  return ethers.formatEther(wei);
};

const formatDate = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

interface Loan {
  id: string;
  borrower: string;
  tokenType: string;
  amount: string;
  interestRate: string;
  interestAmount: string;
  dueDate: string;
  status: string;
  reputation: string;
  purpose: string;
}

interface LoanManagementSystemProps {
  walletAddress?: string;
}

const LoanManagementSystem: React.FC<LoanManagementSystemProps> = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [newLoanAmount, setNewLoanAmount] = useState<string>("");
  const [newLoanDuration, setNewLoanDuration] = useState<string>("30");
  const [newLoanPurpose, setNewLoanPurpose] = useState<string>("");
  const [repayLoanId, setRepayLoanId] = useState<string>("");
  const [repayAmount, setRepayAmount] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Failed to initialize:", error);
        setError(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not found");
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
      setError(null);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const fetchLoans = async () => {
    if (!currentAccount) return;
    
    setIsLoading(true);
    try {
      // This would interact with the Ethereum smart contract
      // For now, using mock data
      const mockLoans: Loan[] = [
        {
          id: "1",
          borrower: currentAccount,
          amount: ethers.parseEther("1.0").toString(),
          interestRate: "10",
          interestAmount: ethers.parseEther("0.1").toString(),
          dueDate: (Math.floor(Date.now() / 1000) + 2592000).toString(), // 30 days from now
          status: "active",
          reputation: "85",
          purpose: "Business expansion",
          tokenType: "ETH"
        }
      ];
      
      setLoans(mockLoans);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch loans:", error);
      setError(`Failed to fetch loans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createLoan = async () => {
    if (!currentAccount || !newLoanAmount || !newLoanDuration || !newLoanPurpose) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error("Wallet not connected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.getSigner();
      
      // This would be the actual contract interaction
      // const contract = new ethers.Contract(LOAN_CONTRACT_ADDRESS, LOAN_CONTRACT_ABI, signer);
      // const tx = await contract.createLoan(
      //   ethers.parseEther(newLoanAmount),
      //   parseInt(newLoanDuration) * 10, // 10% base rate
      //   parseInt(newLoanDuration) * 24 * 60 * 60, // duration in seconds
      //   newLoanPurpose
      // );
      
      // Mock transaction hash for demonstration
      const mockTxHash = "0x" + Math.random().toString(16).substring(2, 66);
      setTxHash(mockTxHash);

      // Create mock loan
      const newLoan: Loan = {
        id: Date.now().toString(),
        borrower: currentAccount,
        tokenType: "ETH",
        amount: ethers.parseEther(newLoanAmount).toString(),
        interestRate: "10",
        interestAmount: ethers.parseEther((parseFloat(newLoanAmount) * 0.1).toString()).toString(),
        dueDate: (Math.floor(Date.now() / 1000) + parseInt(newLoanDuration) * 24 * 60 * 60).toString(),
        status: "active",
        reputation: "85",
        purpose: newLoanPurpose
      };

      setLoans([...loans, newLoan]);
      setNewLoanAmount("");
      setNewLoanDuration("30");
      setNewLoanPurpose("");
      setError(null);
    } catch (error) {
      console.error("Failed to create loan:", error);
      setError(`Failed to create loan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const repayLoan = async () => {
    if (!currentAccount || !repayLoanId || !repayAmount) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (!window.ethereum) throw new Error("Wallet not connected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.getSigner();
      
      // This would be the actual contract interaction
      // const contract = new ethers.Contract(LOAN_CONTRACT_ADDRESS, LOAN_CONTRACT_ABI, signer);
      // const tx = await contract.repayLoan(repayLoanId, {
      //   value: ethers.parseEther(repayAmount)
      // });

      // Mock transaction hash for demonstration
      const mockTxHash = "0x" + Math.random().toString(16).substring(2, 66);
      setTxHash(mockTxHash);

      // Update loan status
      setLoans(loans.map(loan => 
        loan.id === repayLoanId 
          ? { ...loan, status: "repaid" }
          : loan
      ));

      setRepayLoanId("");
      setRepayAmount("");
      setError(null);
    } catch (error) {
      console.error("Failed to repay loan:", error);
      setError(`Failed to repay loan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentAccount) {
      fetchLoans();
    }
  }, [currentAccount]);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg text-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Ethereum Loan Management System
        </h1>
        {!currentAccount ? (
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="text-sm">
            <div className="text-white/70">Connected:</div>
            <div className="font-mono text-cyan-400">
              {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {txHash && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <p className="text-green-200">
            Transaction successful!{" "}
            <a
              className="text-cyan-400 hover:text-cyan-300 underline"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://u2uscan.xyz/tx/${txHash}`}
            >
              View on Etherscan
            </a>
          </p>
        </div>
      )}

      {currentAccount && (
        <div className="space-y-8">
          {/* Current Loans */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Loans</h2>
              <button
                onClick={fetchLoans}
                disabled={isLoading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {loans.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <p>No loans found. Create your first loan below!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 flex-1">
                        <div>
                          <p className="text-white/60 text-sm">Loan Amount</p>
                          <p className="text-white font-semibold">{formatAmount(loan.amount)} ETH</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Interest</p>
                          <p className="text-white font-semibold">{formatAmount(loan.interestAmount)} ETH</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Due Date</p>
                          <p className="text-white font-semibold">{formatDate(loan.dueDate)}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Status</p>
                          <p className={`font-semibold ${
                            loan.status === 'active' ? 'text-green-400' : 
                            loan.status === 'repaid' ? 'text-blue-400' : 'text-red-400'
                          }`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {loan.purpose && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-white/60 text-sm">Purpose: {loan.purpose}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Loan */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Loan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="number"
                step="0.01"
                value={newLoanAmount}
                onChange={(e) => setNewLoanAmount(e.target.value)}
                placeholder="Amount in ETH"
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
              />
              <select
                value={newLoanDuration}
                onChange={(e) => setNewLoanDuration(e.target.value)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="7" className="text-black">7 days</option>
                <option value="30" className="text-black">30 days</option>
                <option value="90" className="text-black">90 days</option>
                <option value="180" className="text-black">180 days</option>
              </select>
              <input
                type="text"
                value={newLoanPurpose}
                onChange={(e) => setNewLoanPurpose(e.target.value)}
                placeholder="Loan purpose"
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={createLoan}
                disabled={isLoading || !newLoanAmount || !newLoanDuration || !newLoanPurpose}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all"
              >
                {isLoading ? "Creating..." : "Create Loan"}
              </button>
            </div>
          </div>

          {/* Repay Loan */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Repay Loan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                value={repayLoanId}
                onChange={(e) => setRepayLoanId(e.target.value)}
                placeholder="Loan ID"
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
              />
              <input
                type="number"
                step="0.01"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="New amount in ETH"
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={repayLoan}
                disabled={isLoading || !repayLoanId || !repayAmount}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all"
              >
                {isLoading ? "Processing..." : "Repay Loan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!currentAccount && (
        <div className="text-center py-12">
          <p className="text-white/60 mb-4">Connect your Ethereum wallet to manage loans</p>
          <button
            onClick={connectWallet}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default LoanManagementSystem;
