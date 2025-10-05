import { useState, useEffect, useCallback } from 'react';
import { elegentDeFiService } from '../services/contractService';

// Flash Loan Hook
export const useFlashLoan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeFlashLoan = useCallback(async (amount: string, targetContract: string, params: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.executeFlashLoan(amount, targetContract, params);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { executeFlashLoan, isLoading, error };
};

// Trust Score Hook
export const useTrustScore = (userAddress?: string) => {
  const [trustScore, setTrustScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrustScore = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const score = await elegentDeFiService.getTrustScore(address);
      setTrustScore(score);
      return score;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTrustScore = useCallback(async (address: string, newScore: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.updateTrustScore(address, newScore);
      await fetchTrustScore(address); // Refresh the score
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchTrustScore]);

  useEffect(() => {
    if (userAddress) {
      fetchTrustScore(userAddress);
    }
  }, [userAddress, fetchTrustScore]);

  return { 
    trustScore, 
    fetchTrustScore, 
    updateTrustScore, 
    isLoading, 
    error 
  };
};

// Staking Hook
export const useStaking = (userAddress?: string) => {
  const [stakingInfo, setStakingInfo] = useState({
    stakedAmount: '0',
    rewardsEarned: '0',
    lastStakeTime: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStakingInfo = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const info = await elegentDeFiService.getStakingInfo(address);
      setStakingInfo(info);
      return info;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stake = useCallback(async (amount: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.stake(amount);
      if (userAddress) {
        await fetchStakingInfo(userAddress); // Refresh the info
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, fetchStakingInfo]);

  const unstake = useCallback(async (amount: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.unstake(amount);
      if (userAddress) {
        await fetchStakingInfo(userAddress); // Refresh the info
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, fetchStakingInfo]);

  const claimRewards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.claimStakingRewards();
      if (userAddress) {
        await fetchStakingInfo(userAddress); // Refresh the info
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, fetchStakingInfo]);

  useEffect(() => {
    if (userAddress) {
      fetchStakingInfo(userAddress);
    }
  }, [userAddress, fetchStakingInfo]);

  return { 
    stakingInfo, 
    stake, 
    unstake, 
    claimRewards, 
    fetchStakingInfo, 
    isLoading, 
    error 
  };
};

// Governance Hook
export const useGovernance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProposal = useCallback(async (description: string, target: string, calldata: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.createProposal(description, target, calldata);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const vote = useCallback(async (proposalId: number, support: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.vote(proposalId, support);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeProposal = useCallback(async (proposalId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.executeProposal(proposalId);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    createProposal, 
    vote, 
    executeProposal, 
    isLoading, 
    error 
  };
};

// Enhanced Loan Hook
export const useEnhancedLoans = (userAddress?: string) => {
  const [loans, setLoans] = useState({ borrowedLoans: [], lentLoans: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserLoans = useCallback(async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userLoans = await elegentDeFiService.getUserLoans(address);
      setLoans(userLoans);
      return userLoans;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLoan = useCallback(async (
    amount: string, 
    interestRate: number, 
    duration: number, 
    collateralAddress: string, 
    collateralAmount: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.createLoan(amount, interestRate, duration, collateralAddress, collateralAmount);
      if (userAddress) {
        await fetchUserLoans(userAddress); // Refresh loans
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, fetchUserLoans]);

  const acceptLoan = useCallback(async (loanId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.acceptLoan(loanId);
      if (userAddress) {
        await fetchUserLoans(userAddress); // Refresh loans
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, fetchUserLoans]);

  const repayLoan = useCallback(async (loanId: number, amount: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.repayLoan(loanId, amount);
      if (userAddress) {
        await fetchUserLoans(userAddress); // Refresh loans
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, fetchUserLoans]);

  const liquidateLoan = useCallback(async (loanId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.liquidateLoan(loanId);
      if (userAddress) {
        await fetchUserLoans(userAddress); // Refresh loans
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, fetchUserLoans]);

  const getLoan = useCallback(async (loanId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const loan = await elegentDeFiService.getLoan(loanId);
      return loan;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userAddress) {
      fetchUserLoans(userAddress);
    }
  }, [userAddress, fetchUserLoans]);

  return { 
    loans, 
    createLoan, 
    acceptLoan, 
    repayLoan, 
    liquidateLoan, 
    getLoan, 
    fetchUserLoans, 
    isLoading, 
    error 
  };
};

// Platform Stats Hook
export const usePlatformStats = () => {
  const [stats, setStats] = useState({
    totalLoans: 0,
    totalStaked: '0',
    platformBalance: '0',
    contractAddress: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const platformStats = await elegentDeFiService.getPlatformStats();
      setStats(platformStats);
      return platformStats;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, fetchStats, isLoading, error };
};

// Emergency Functions Hook
export const useEmergency = () => {
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPauseStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const paused = await elegentDeFiService.isPaused();
      setIsPaused(paused);
      return paused;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pauseContract = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.pause();
      await checkPauseStatus(); // Refresh status
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkPauseStatus]);

  const unpauseContract = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await elegentDeFiService.unpause();
      await checkPauseStatus(); // Refresh status
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [checkPauseStatus]);

  useEffect(() => {
    checkPauseStatus();
  }, [checkPauseStatus]);

  return { 
    isPaused, 
    pauseContract, 
    unpauseContract, 
    checkPauseStatus, 
    isLoading, 
    error 
  };
};