import { ethers, BrowserProvider, Contract, parseEther, formatEther, toUtf8Bytes } from 'ethers';
import { ENV_CONFIG } from '../config/env';
import { ELEGENT_DEFI_PLATFORM_ABI } from '../contracts/ElegentDeFiPlatform.abi';

// Legacy Contract ABI (for backward compatibility)
export const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "liquidator",
        "type": "address"
      }
    ],
    "name": "addLiquidator",
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
    "name": "addLiquidity",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "addSupportedToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "createTrustScore",
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
      },
      {
        "internalType": "bytes",
        "name": "params",
        "type": "bytes"
      }
    ],
    "name": "flashLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
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
        "name": "fee",
        "type": "uint256"
      }
    ],
    "name": "FlashLoanExecuted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "liquidateLoan",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
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
        "name": "rate",
        "type": "uint256"
      }
    ],
    "name": "LoanCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "liquidator",
        "type": "address"
      }
    ],
    "name": "LoanLiquidated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "early",
        "type": "bool"
      }
    ],
    "name": "LoanRepaid",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "loanId",
        "type": "uint256"
      }
    ],
    "name": "repayLoan",
    "outputs": [],
    "stateMutability": "payable",
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
    "name": "requestLoan",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_paused",
        "type": "bool"
      }
    ],
    "name": "setPaused",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stake",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Unstaked",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  },
  {
    "inputs": [],
    "name": "admin",
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
    "inputs": [],
    "name": "BPS_DIVISOR",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      }
    ],
    "name": "calculateDynamicRate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "calculateMaxLoan",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "FLASH_LOAN_FEE_BPS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getPendingRewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserLoans",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "liquidators",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "LOAN_DURATION",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "loanNFT",
    "outputs": [
      {
        "internalType": "contract LoanNFT",
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
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "loans",
    "outputs": [
      {
        "internalType": "address",
        "name": "borrower",
        "type": "address"
      },
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
        "name": "interest",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "dueDate",
        "type": "uint256"
      },
      {
        "internalType": "enum ElegentDeFiPlatform.LoanStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "nftId",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_LOAN_AMOUNT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_TRUST_SCORE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MIN_LOAN_AMOUNT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "moderators",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PLATFORM_FEE_BPS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "refinancedLoans",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "stakes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rewards",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastRewardTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "supportedTokens",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "tokenLiquidity",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalLoans",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalStaked",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalVolume",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "treasuryBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "trustScoreNFT",
    "outputs": [
      {
        "internalType": "contract TrustScoreNFT",
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
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userLoans",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WEEK",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Contract configuration using environment variables
export const CONTRACT_CONFIG = {
  ADDRESS: ENV_CONFIG.LOAN_PLATFORM_CONTRACT,
  ABI: ELEGENT_DEFI_PLATFORM_ABI,
  LOAN_NFT_ADDRESS: ENV_CONFIG.LOAN_NFT_CONTRACT,
  TRUST_SCORE_ADDRESS: ENV_CONFIG.TRUST_SCORE_CONTRACT,
  MAINNET_RPC: ENV_CONFIG.MAINNET_RPC,
  TESTNET_RPC: ENV_CONFIG.SEPOLIA_RPC,
  LOCALHOST_RPC: ENV_CONFIG.LOCALHOST_RPC,
  CHAIN_ID: {
    MAINNET: 1,
    SEPOLIA: 11155111,
    LOCALHOST: 31337,
  },
  DEPLOYMENT_INFO: {
    BLOCK: ENV_CONFIG.DEPLOYED_BLOCK,
    HASH: ENV_CONFIG.DEPLOYMENT_HASH,
    DEPLOYER: ENV_CONFIG.DEPLOYER_ADDRESS
  }
};

// Loan Status enum
export enum LoanStatus {
  PENDING = 0,
  ACTIVE = 1,
  REPAID = 2,
  LIQUIDATED = 3,
  DEFAULTED = 4
}

// Types
export interface Loan {
  borrower: string;
  token: string;
  amount: string;
  interest: string;
  rate: string;
  dueDate: string;
  status: LoanStatus;
  nftId: string;
}

export interface UserStake {
  amount: string;
  rewards: string;
  lastRewardTime: string;
}

export interface ContractData {
  totalLoans: string;
  totalStaked: string;
  totalVolume: string;
  treasuryBalance: string;
  maxLoanAmount: string;
  minLoanAmount: string;
  platformFeeBps: string;
  flashLoanFeeBps: string;
  loanDuration: string;
  maxTrustScore: string;
}

// Contract Service Class
export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_ABI, this.signer);
    }
  }

  // Check if wallet is connected
  async isWalletConnected(): Promise<boolean> {
    if (!this.provider) return false;
    const accounts = await this.provider.listAccounts();
    return accounts.length > 0;
  }

  // Connect wallet
  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    await this.initializeProvider();
    
    if (!this.signer) {
      throw new Error('Failed to initialize signer');
    }

    return await this.signer.getAddress();
  }

  // Get contract instance
  getContract(): ethers.Contract | null {
    return this.contract;
  }

  // Loan Functions
  async requestLoan(tokenAddress: string, amount: string, ethValue?: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const amountBN = parseEther(amount);
    const options = ethValue ? { value: parseEther(ethValue) } : {};
    
    return await this.contract.requestLoan(tokenAddress, amountBN, options);
  }

  async repayLoan(loanId: number, ethValue: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const options = { value: parseEther(ethValue) };
    return await this.contract.repayLoan(loanId, options);
  }

  async liquidateLoan(loanId: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.liquidateLoan(loanId);
  }

  // Staking Functions
  async stake(amount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const options = { value: parseEther(amount) };
    return await this.contract.stake(options);
  }

  async unstake(amount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const amountBN = parseEther(amount);
    return await this.contract.unstake(amountBN);
  }

  // Flash Loan Functions
  async flashLoan(tokenAddress: string, amount: string, params: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const amountBN = parseEther(amount);
    const paramsBytes = toUtf8Bytes(params);
    
    return await this.contract.flashLoan(tokenAddress, amountBN, paramsBytes);
  }

  // Liquidity Functions
  async addLiquidity(tokenAddress: string, amount: string, ethValue?: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const amountBN = parseEther(amount);
    const options = ethValue ? { value: parseEther(ethValue) } : {};
    
    return await this.contract.addLiquidity(tokenAddress, amountBN, options);
  }

  // Trust Score Functions
  async createTrustScore(): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.createTrustScore();
  }

  // View Functions
  async getUserLoans(userAddress: string): Promise<string[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getUserLoans(userAddress);
  }

  async getLoan(loanId: number): Promise<Loan> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.loans(loanId);
  }

  async calculateMaxLoan(userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    const result = await this.contract.calculateMaxLoan(userAddress);
    return formatEther(result);
  }

  async calculateDynamicRate(score: number): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    const result = await this.contract.calculateDynamicRate(score);
    return result.toString();
  }

  async getPendingRewards(userAddress: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    const result = await this.contract.getPendingRewards(userAddress);
    return formatEther(result);
  }

  async getUserStake(userAddress: string): Promise<UserStake> {
    if (!this.contract) throw new Error('Contract not initialized');
    const result = await this.contract.stakes(userAddress);
    return {
      amount: formatEther(result.amount),
      rewards: formatEther(result.rewards),
      lastRewardTime: result.lastRewardTime.toString()
    };
  }

  async getContractData(): Promise<ContractData> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const [
      totalLoans,
      totalStaked,
      totalVolume,
      treasuryBalance,
      maxLoanAmount,
      minLoanAmount,
      platformFeeBps,
      flashLoanFeeBps,
      loanDuration,
      maxTrustScore
    ] = await Promise.all([
      this.contract.totalLoans(),
      this.contract.totalStaked(),
      this.contract.totalVolume(),
      this.contract.treasuryBalance(),
      this.contract.MAX_LOAN_AMOUNT(),
      this.contract.MIN_LOAN_AMOUNT(),
      this.contract.PLATFORM_FEE_BPS(),
      this.contract.FLASH_LOAN_FEE_BPS(),
      this.contract.LOAN_DURATION(),
      this.contract.MAX_TRUST_SCORE()
    ]);

    return {
      totalLoans: totalLoans.toString(),
      totalStaked: formatEther(totalStaked),
      totalVolume: formatEther(totalVolume),
      treasuryBalance: formatEther(treasuryBalance),
      maxLoanAmount: formatEther(maxLoanAmount),
      minLoanAmount: formatEther(minLoanAmount),
      platformFeeBps: platformFeeBps.toString(),
      flashLoanFeeBps: flashLoanFeeBps.toString(),
      loanDuration: loanDuration.toString(),
      maxTrustScore: maxTrustScore.toString()
    };
  }

  // Admin Functions (only for contract owner)
  async addLiquidator(liquidatorAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.addLiquidator(liquidatorAddress);
  }

  async addSupportedToken(tokenAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.addSupportedToken(tokenAddress);
  }

  async setPaused(paused: boolean): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.setPaused(paused);
  }

  // Event Listeners
  onLoanCreated(callback: (loanId: number, borrower: string, amount: string, rate: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('LoanCreated', (loanId, borrower, amount, rate) => {
      callback(Number(loanId), borrower, formatEther(amount), rate.toString());
    });
  }

  onLoanRepaid(callback: (loanId: number, borrower: string, early: boolean) => void) {
    if (!this.contract) return;
    
    this.contract.on('LoanRepaid', (loanId, borrower, early) => {
      callback(Number(loanId), borrower, early);
    });
  }

  onStaked(callback: (user: string, amount: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('Staked', (user, amount) => {
      callback(user, formatEther(amount));
    });
  }

  onUnstaked(callback: (user: string, amount: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('Unstaked', (user, amount) => {
      callback(user, formatEther(amount));
    });
  }

  onFlashLoanExecuted(callback: (borrower: string, token: string, amount: string, fee: string) => void) {
    if (!this.contract) return;
    
    this.contract.on('FlashLoanExecuted', (borrower, token, amount, fee) => {
      callback(borrower, token, formatEther(amount), formatEther(fee));
    });
  }

  // Utility Functions
  async waitForTransaction(tx: ethers.ContractTransactionResponse): Promise<ethers.ContractTransactionReceipt | null> {
    return await tx.wait();
  }

  formatEther(value: string): string {
    return formatEther(value);
  }

  parseEther(value: string): bigint {
    return parseEther(value);
  }
}

// Export singleton instance
export const contractService = new ContractService();

// Enhanced Contract Service with Complete Features
export class ElegentDeFiService {
  private contract: Contract | null = null;
  private provider: BrowserProvider | null = null;
  private signer: any = null;

  async initialize() {
    if (typeof window.ethereum !== 'undefined') {
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new Contract(CONTRACT_CONFIG.ADDRESS, CONTRACT_CONFIG.ABI, this.signer);
      return true;
    }
    throw new Error('Please install MetaMask to use this application');
  }

  private async ensureContract() {
    if (!this.contract) {
      await this.initialize();
    }
    return this.contract!;
  }

  // Loan Management
  async createLoan(amount: string, interestRate: number, duration: number, collateralAddress: string, collateralAmount: string) {
    const contract = await this.ensureContract();
    const tx = await contract.createLoan(
      parseEther(amount),
      interestRate * 100, // Convert to basis points
      duration,
      collateralAddress,
      parseEther(collateralAmount)
    );
    return await tx.wait();
  }

  async acceptLoan(loanId: number) {
    const contract = await this.ensureContract();
    const loan = await contract.loans(loanId);
    const tx = await contract.acceptLoan(loanId, { value: loan.amount });
    return await tx.wait();
  }

  async repayLoan(loanId: number, amount: string) {
    const contract = await this.ensureContract();
    const tx = await contract.repayLoan(loanId, { value: parseEther(amount) });
    return await tx.wait();
  }

  async liquidateLoan(loanId: number) {
    const contract = await this.ensureContract();
    const tx = await contract.liquidateLoan(loanId);
    return await tx.wait();
  }

  // Flash Loans
  async executeFlashLoan(amount: string, targetContract: string, params: string) {
    const contract = await this.ensureContract();
    const tx = await contract.flashLoan(parseEther(amount), targetContract, toUtf8Bytes(params));
    return await tx.wait();
  }

  // Trust Score Management
  async getTrustScore(user: string): Promise<number> {
    const contract = await this.ensureContract();
    return await contract.getUserTrustScore(user);
  }

  async updateTrustScore(user: string, newScore: number) {
    const contract = await this.ensureContract();
    const tx = await contract.updateTrustScore(user, newScore);
    return await tx.wait();
  }

  // Staking System
  async stake(amount: string) {
    const contract = await this.ensureContract();
    const tx = await contract.stake({ value: parseEther(amount) });
    return await tx.wait();
  }

  async unstake(amount: string) {
    const contract = await this.ensureContract();
    const tx = await contract.unstake(parseEther(amount));
    return await tx.wait();
  }

  async claimStakingRewards() {
    const contract = await this.ensureContract();
    const tx = await contract.claimStakingRewards();
    return await tx.wait();
  }

  async getStakingInfo(user: string) {
    const contract = await this.ensureContract();
    const info = await contract.stakingInfo(user);
    return {
      stakedAmount: formatEther(info.stakedAmount),
      rewardsEarned: formatEther(info.rewardsEarned),
      lastStakeTime: Number(info.lastStakeTime)
    };
  }

  // Governance
  async createProposal(description: string, target: string, calldata: string) {
    const contract = await this.ensureContract();
    const tx = await contract.createProposal(description, target, calldata);
    return await tx.wait();
  }

  async vote(proposalId: number, support: boolean) {
    const contract = await this.ensureContract();
    const tx = await contract.vote(proposalId, support);
    return await tx.wait();
  }

  async executeProposal(proposalId: number) {
    const contract = await this.ensureContract();
    const tx = await contract.executeProposal(proposalId);
    return await tx.wait();
  }

  // View Functions
  async getLoan(loanId: number) {
    const contract = await this.ensureContract();
    const loan = await contract.loans(loanId);
    return {
      borrower: loan.borrower,
      lender: loan.lender,
      amount: formatEther(loan.amount),
      interestRate: Number(loan.interestRate) / 100,
      duration: Number(loan.duration),
      startTime: Number(loan.startTime),
      isActive: loan.isActive,
      isRepaid: loan.isRepaid,
      collateralToken: loan.collateralToken,
      collateralAmount: formatEther(loan.collateralAmount)
    };
  }

  async getUserLoans(user: string) {
    const contract = await this.ensureContract();
    const borrowedLoans = await contract.getUserBorrowedLoans(user);
    const lentLoans = await contract.getUserLentLoans(user);
    return { borrowedLoans, lentLoans };
  }

  async getPlatformStats() {
    const contract = await this.ensureContract();
    const totalLoans = await contract.loanCounter();
    const totalStaked = await contract.totalStaked();
    const platformBalance = await this.provider?.getBalance(CONTRACT_CONFIG.ADDRESS);
    
    return {
      totalLoans: Number(totalLoans),
      totalStaked: formatEther(totalStaked),
      platformBalance: formatEther(platformBalance || 0),
      contractAddress: CONTRACT_CONFIG.ADDRESS
    };
  }

  // Utility Functions
  async getContractEvents(eventName: string, fromBlock: number = 0) {
    const contract = await this.ensureContract();
    const filter = contract.filters[eventName]();
    return await contract.queryFilter(filter, fromBlock);
  }

  async waitForTransaction(txHash: string) {
    if (!this.provider) await this.initialize();
    return await this.provider?.waitForTransaction(txHash);
  }

  // Emergency Functions
  async pause() {
    const contract = await this.ensureContract();
    const tx = await contract.pause();
    return await tx.wait();
  }

  async unpause() {
    const contract = await this.ensureContract();
    const tx = await contract.unpause();
    return await tx.wait();
  }

  async isPaused(): Promise<boolean> {
    const contract = await this.ensureContract();
    return await contract.paused();
  }
}

// Create singleton instance
export const elegentDeFiService = new ElegentDeFiService();