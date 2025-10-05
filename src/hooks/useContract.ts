import { useState, useEffect, useCallback } from 'react';
import { contractService, ContractData, Loan, UserStake } from '../services/contractService';

export interface ContractState {
  isConnected: boolean;
  userAddress: string;
  contractData: ContractData | null;
  userLoans: string[];
  userStake: UserStake | null;
  maxLoanAmount: string;
  pendingRewards: string;
  isLoading: boolean;
  error: string | null;
}

export const useContract = () => {
  const [state, setState] = useState<ContractState>({
    isConnected: false,
    userAddress: '',
    contractData: null,
    userLoans: [],
    userStake: null,
    maxLoanAmount: '0',
    pendingRewards: '0',
    isLoading: false,
    error: null,
  });

  // Connect wallet
  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const address = await contractService.connectWallet();
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        userAddress: address,
        isLoading: false 
      }));
      
      // Load user data after connecting
      await loadUserData(address);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
        isLoading: false 
      }));
    }
  }, []);

  // Load contract data
  const loadContractData = useCallback(async () => {
    try {
      const data = await contractService.getContractData();
      setState(prev => ({ ...prev, contractData: data }));
    } catch (error) {
      console.error('Failed to load contract data:', error);
    }
  }, []);

  // Load user-specific data
  const loadUserData = useCallback(async (address: string) => {
    if (!address) return;
    
    try {
      const [loans, stake, maxLoan, rewards] = await Promise.all([
        contractService.getUserLoans(address),
        contractService.getUserStake(address),
        contractService.calculateMaxLoan(address),
        contractService.getPendingRewards(address),
      ]);

      setState(prev => ({
        ...prev,
        userLoans: loans,
        userStake: stake,
        maxLoanAmount: maxLoan,
        pendingRewards: rewards,
      }));
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, []);

  // Request a loan
  const requestLoan = useCallback(async (tokenAddress: string, amount: string, ethValue?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const tx = await contractService.requestLoan(tokenAddress, amount, ethValue);
      await contractService.waitForTransaction(tx);
      
      // Reload user data after successful transaction
      if (state.userAddress) {
        await loadUserData(state.userAddress);
      }
      await loadContractData();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return tx;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to request loan',
        isLoading: false 
      }));
      throw error;
    }
  }, [state.userAddress, loadUserData, loadContractData]);

  // Repay a loan
  const repayLoan = useCallback(async (loanId: number, ethValue: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const tx = await contractService.repayLoan(loanId, ethValue);
      await contractService.waitForTransaction(tx);
      
      // Reload user data after successful transaction
      if (state.userAddress) {
        await loadUserData(state.userAddress);
      }
      await loadContractData();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return tx;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to repay loan',
        isLoading: false 
      }));
      throw error;
    }
  }, [state.userAddress, loadUserData, loadContractData]);

  // Stake tokens
  const stake = useCallback(async (amount: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const tx = await contractService.stake(amount);
      await contractService.waitForTransaction(tx);
      
      // Reload user data after successful transaction
      if (state.userAddress) {
        await loadUserData(state.userAddress);
      }
      await loadContractData();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return tx;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to stake',
        isLoading: false 
      }));
      throw error;
    }
  }, [state.userAddress, loadUserData, loadContractData]);

  // Unstake tokens
  const unstake = useCallback(async (amount: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const tx = await contractService.unstake(amount);
      await contractService.waitForTransaction(tx);
      
      // Reload user data after successful transaction
      if (state.userAddress) {
        await loadUserData(state.userAddress);
      }
      await loadContractData();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return tx;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to unstake',
        isLoading: false 
      }));
      throw error;
    }
  }, [state.userAddress, loadUserData, loadContractData]);

  // Create trust score
  const createTrustScore = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const tx = await contractService.createTrustScore();
      await contractService.waitForTransaction(tx);
      
      // Reload user data after successful transaction
      if (state.userAddress) {
        await loadUserData(state.userAddress);
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      return tx;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create trust score',
        isLoading: false 
      }));
      throw error;
    }
  }, [state.userAddress, loadUserData]);

  // Flash loan
  const flashLoan = useCallback(async (tokenAddress: string, amount: string, params: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const tx = await contractService.flashLoan(tokenAddress, amount, params);
      await contractService.waitForTransaction(tx);
      
      // Reload data after successful transaction
      await loadContractData();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return tx;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to execute flash loan',
        isLoading: false 
      }));
      throw error;
    }
  }, [loadContractData]);

  // Add liquidity
  const addLiquidity = useCallback(async (tokenAddress: string, amount: string, ethValue?: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const tx = await contractService.addLiquidity(tokenAddress, amount, ethValue);
      await contractService.waitForTransaction(tx);
      
      // Reload data after successful transaction
      await loadContractData();
      
      setState(prev => ({ ...prev, isLoading: false }));
      return tx;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to add liquidity',
        isLoading: false 
      }));
      throw error;
    }
  }, [loadContractData]);

  // Get loan details
  const getLoanDetails = useCallback(async (loanId: number): Promise<Loan | null> => {
    try {
      return await contractService.getLoan(loanId);
    } catch (error) {
      console.error('Failed to get loan details:', error);
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize contract data on mount
  useEffect(() => {
    loadContractData();
  }, [loadContractData]);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await contractService.isWalletConnected();
        if (isConnected && contractService.getContract()) {
          // Get the current account
          const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setState(prev => ({ 
              ...prev, 
              isConnected: true, 
              userAddress: accounts[0] 
            }));
            await loadUserData(accounts[0]);
          }
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    checkConnection();
  }, [loadUserData]);

  // Set up event listeners
  useEffect(() => {
    if (!state.isConnected || !state.userAddress) return;

    // Listen for loan events
    contractService.onLoanCreated((loanId, borrower, amount, rate) => {
      if (borrower.toLowerCase() === state.userAddress.toLowerCase()) {
        console.log(`Loan ${loanId} created: ${amount} ETH at ${rate}% rate`);
        loadUserData(state.userAddress);
      }
    });

    contractService.onLoanRepaid((loanId, borrower, early) => {
      if (borrower.toLowerCase() === state.userAddress.toLowerCase()) {
        console.log(`Loan ${loanId} repaid${early ? ' early' : ''}`);
        loadUserData(state.userAddress);
      }
    });

    contractService.onStaked((user, amount) => {
      if (user.toLowerCase() === state.userAddress.toLowerCase()) {
        console.log(`Staked ${amount} ETH`);
        loadUserData(state.userAddress);
      }
    });

    contractService.onUnstaked((user, amount) => {
      if (user.toLowerCase() === state.userAddress.toLowerCase()) {
        console.log(`Unstaked ${amount} ETH`);
        loadUserData(state.userAddress);
      }
    });

    contractService.onFlashLoanExecuted((borrower, token, amount, fee) => {
      console.log(`Flash loan executed: ${amount} ${token} with fee ${fee}`);
      loadContractData();
    });

  }, [state.isConnected, state.userAddress, loadUserData, loadContractData]);

  return {
    ...state,
    connectWallet,
    requestLoan,
    repayLoan,
    stake,
    unstake,
    createTrustScore,
    flashLoan,
    addLiquidity,
    getLoanDetails,
    loadContractData,
    loadUserData: () => state.userAddress ? loadUserData(state.userAddress) : Promise.resolve(),
    clearError,
  };
};