/**
 * Environment configuration and validation for the application
 */

// Types for environment variables
interface EnvironmentConfig {
  PARTICLE_PROJECT_ID: string;
  PARTICLE_CLIENT_KEY: string;
  PARTICLE_APP_ID: string;
  DEFAULT_NETWORK: 'mainnet' | 'testnet' | 'localhost';
  MODULE_ADDRESS?: string;
  API_BASE_URL?: string;
  ENABLE_ANALYTICS?: string;
  // Smart Contract Addresses
  LOAN_PLATFORM_CONTRACT: string;
  LOAN_NFT_CONTRACT: string;
  TRUST_SCORE_CONTRACT: string;
  // Network Configuration
  MAINNET_RPC: string;
  SEPOLIA_RPC: string;
  LOCALHOST_RPC: string;
  // Deployment Info
  DEPLOYED_BLOCK: number;
  DEPLOYMENT_HASH: string;
  DEPLOYER_ADDRESS: string;
}

// Environment variable keys
const ENV_KEYS = {
  PARTICLE_PROJECT_ID: 'VITE_PARTICLE_PROJECT_ID',
  PARTICLE_CLIENT_KEY: 'VITE_PARTICLE_CLIENT_KEY', 
  PARTICLE_APP_ID: 'VITE_PARTICLE_APP_ID',
  DEFAULT_NETWORK: 'VITE_DEFAULT_NETWORK',
  MODULE_ADDRESS: 'VITE_MODULE_ADDRESS',
  API_BASE_URL: 'VITE_API_BASE_URL',
  ENABLE_ANALYTICS: 'VITE_ENABLE_ANALYTICS',
  // Smart Contract Addresses
  LOAN_PLATFORM_CONTRACT: 'VITE_LOAN_PLATFORM_CONTRACT',
  LOAN_NFT_CONTRACT: 'VITE_LOAN_NFT_CONTRACT',
  TRUST_SCORE_CONTRACT: 'VITE_TRUST_SCORE_CONTRACT',
  // Network Configuration
  MAINNET_RPC: 'VITE_MAINNET_RPC',
  SEPOLIA_RPC: 'VITE_SEPOLIA_RPC',
  LOCALHOST_RPC: 'VITE_LOCALHOST_RPC',
  // Deployment Info
  DEPLOYED_BLOCK: 'VITE_DEPLOYED_BLOCK',
  DEPLOYMENT_HASH: 'VITE_DEPLOYMENT_HASH',
  DEPLOYER_ADDRESS: 'VITE_DEPLOYER_ADDRESS',
} as const;

// Default values
const DEFAULTS = {
  DEFAULT_NETWORK: 'testnet' as const,
  PARTICLE_PROJECT_ID: 'your_particle_project_id',
  PARTICLE_CLIENT_KEY: 'your_particle_client_key',
  PARTICLE_APP_ID: 'your_particle_app_id',
  API_BASE_URL: 'https://api.coingecko.com/api/v3',
  ENABLE_ANALYTICS: 'false',
} as const;

/**
 * Get environment variable with fallback (type-safe)
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
  const env = import.meta.env as unknown as Record<string, string>;
  return env[key] || defaultValue || '';
};

/**
 * Parse environment variables with type safety
 */
const parseEnvConfig = (): EnvironmentConfig => {
  const network = getEnvVar(ENV_KEYS.DEFAULT_NETWORK, DEFAULTS.DEFAULT_NETWORK);
  
  return {
    PARTICLE_PROJECT_ID: getEnvVar(ENV_KEYS.PARTICLE_PROJECT_ID, DEFAULTS.PARTICLE_PROJECT_ID),
    PARTICLE_CLIENT_KEY: getEnvVar(ENV_KEYS.PARTICLE_CLIENT_KEY, DEFAULTS.PARTICLE_CLIENT_KEY),
    PARTICLE_APP_ID: getEnvVar(ENV_KEYS.PARTICLE_APP_ID, DEFAULTS.PARTICLE_APP_ID),
    DEFAULT_NETWORK: (network === 'mainnet' || network === 'testnet' || network === 'localhost') ? network : DEFAULTS.DEFAULT_NETWORK,
    MODULE_ADDRESS: getEnvVar(ENV_KEYS.MODULE_ADDRESS),
    API_BASE_URL: getEnvVar(ENV_KEYS.API_BASE_URL, DEFAULTS.API_BASE_URL),
    ENABLE_ANALYTICS: getEnvVar(ENV_KEYS.ENABLE_ANALYTICS, DEFAULTS.ENABLE_ANALYTICS),
    // Smart Contract Addresses
    LOAN_PLATFORM_CONTRACT: getEnvVar(ENV_KEYS.LOAN_PLATFORM_CONTRACT, '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8'),
    LOAN_NFT_CONTRACT: getEnvVar(ENV_KEYS.LOAN_NFT_CONTRACT, '0x0000000000000000000000000000000000000000'),
    TRUST_SCORE_CONTRACT: getEnvVar(ENV_KEYS.TRUST_SCORE_CONTRACT, '0x0000000000000000000000000000000000000000'),
    // Network Configuration
    MAINNET_RPC: getEnvVar(ENV_KEYS.MAINNET_RPC, 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'),
    SEPOLIA_RPC: getEnvVar(ENV_KEYS.SEPOLIA_RPC, 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'),
    LOCALHOST_RPC: getEnvVar(ENV_KEYS.LOCALHOST_RPC, 'http://127.0.0.1:8545'),
    // Deployment Info
    DEPLOYED_BLOCK: Number(getEnvVar(ENV_KEYS.DEPLOYED_BLOCK, '23510035')),
    DEPLOYMENT_HASH: getEnvVar(ENV_KEYS.DEPLOYMENT_HASH, '0x3cd8ed022e68dde98179b346356819877f2aa15f2fab03e50048da71c03a067a'),
    DEPLOYER_ADDRESS: getEnvVar(ENV_KEYS.DEPLOYER_ADDRESS, '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'),
  };
};

// Parsed environment configuration
export const ENV_CONFIG = parseEnvConfig();

/**
 * Ethereum Network configuration
 */
export const ETHEREUM_CONFIG = {
  projectId: ENV_CONFIG.PARTICLE_PROJECT_ID,
  clientKey: ENV_CONFIG.PARTICLE_CLIENT_KEY,
  appId: ENV_CONFIG.PARTICLE_APP_ID,
  chainName: 'Ethereum',
  chainId: ENV_CONFIG.DEFAULT_NETWORK === 'testnet' ? 11155111 : 1, // 1 for mainnet, 11155111 for sepolia
} as const;

/**
 * Application configuration derived from environment
 */
export const APP_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  network: ENV_CONFIG.DEFAULT_NETWORK,
  moduleAddress: ENV_CONFIG.MODULE_ADDRESS,
  apiBaseUrl: ENV_CONFIG.API_BASE_URL,
  enableAnalytics: ENV_CONFIG.ENABLE_ANALYTICS === 'true',
  enableDebugLogs: import.meta.env.DEV,
} as const;

/**
 * Network endpoints configuration
 */
export const NETWORK_ENDPOINTS = {
  mainnet: 'https://mainnet.infura.io/v3/',
  testnet: 'https://sepolia.infura.io/v3/',
} as const;

/**
 * Validation functions
 */
export const validateEnv = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required Particle Network variables
  const requiredParticleVars = [
    'PARTICLE_PROJECT_ID',
    'PARTICLE_CLIENT_KEY', 
    'PARTICLE_APP_ID'
  ] as const;
  
  for (const varName of requiredParticleVars) {
    const value = ENV_CONFIG[varName];
    if (!value || value.startsWith('your_particle_')) {
      errors.push(`Missing or invalid ${varName}`);
    }
  }
  
  // Validate network
  if (!['mainnet', 'testnet'].includes(ENV_CONFIG.DEFAULT_NETWORK)) {
    errors.push('DEFAULT_NETWORK must be either "mainnet" or "testnet"');
  }
  
  // Validate module address format if provided
  if (ENV_CONFIG.MODULE_ADDRESS && !/^0x[a-fA-F0-9]+$/.test(ENV_CONFIG.MODULE_ADDRESS)) {
    errors.push('MODULE_ADDRESS must be a valid hex address starting with 0x');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Log environment status
 */
export const logEnvStatus = (): void => {
  if (!APP_CONFIG.enableDebugLogs) return;
  
  const validation = validateEnv();
  
  console.group('🔧 Environment Configuration');
  console.log('Network:', ENV_CONFIG.DEFAULT_NETWORK);
  console.log('Module Address:', ENV_CONFIG.MODULE_ADDRESS || 'Not configured');
  console.log('Analytics Enabled:', APP_CONFIG.enableAnalytics);
  
  if (validation.isValid) {
    console.log('✅ Environment validation passed');
  } else {
    console.warn('⚠️ Environment validation issues:');
    validation.errors.forEach(error => console.warn(`  - ${error}`));
  }
  
  console.groupEnd();
};

// Auto-validate and log in development
if (APP_CONFIG.isDevelopment) {
  logEnvStatus();
}
