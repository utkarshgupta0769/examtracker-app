/**
 * Utility for detecting and retrieving canister IDs in different environments
 * Handles both local development and production deployment on the Internet Computer
 */

/**
 * Detects if the app is running in production (on the Internet Computer mainnet)
 * @returns true if running on IC mainnet, false otherwise
 */
export function isProductionEnvironment(): boolean {
  // Check if we're on an IC domain
  const hostname = window.location.hostname;
  const isICDomain = hostname.endsWith('.ic0.app') || 
                     hostname.endsWith('.icp0.io') ||
                     hostname.endsWith('.raw.ic0.app') ||
                     hostname.endsWith('.raw.icp0.io');
  
  // Check environment variables
  const dfxNetwork = import.meta.env.DFX_NETWORK;
  const nodeEnv = import.meta.env.MODE;
  
  return isICDomain || dfxNetwork === 'ic' || nodeEnv === 'production';
}

/**
 * Gets the backend canister ID from environment variables
 * Tries multiple naming conventions to ensure compatibility
 * @returns The canister ID string or null if not found
 */
export function getBackendCanisterId(): string | null {
  // Try different environment variable naming conventions
  const canisterId = 
    import.meta.env.VITE_BACKEND_CANISTER_ID ||
    import.meta.env.CANISTER_ID_BACKEND ||
    import.meta.env.BACKEND_CANISTER_ID ||
    import.meta.env.VITE_CANISTER_ID_BACKEND ||
    null;
  
  if (canisterId) {
    console.log('Backend canister ID found:', canisterId);
    return canisterId;
  }
  
  console.warn('Backend canister ID not found in environment variables');
  return null;
}

/**
 * Gets the appropriate host URL for the Internet Computer agent
 * @returns The host URL string
 */
export function getICHost(): string {
  if (isProductionEnvironment()) {
    // Production: use IC mainnet
    return 'https://icp-api.io';
  } else {
    // Local development
    return 'http://127.0.0.1:4943';
  }
}

/**
 * Determines if we should fetch the root key
 * Root key should only be fetched in local development, never in production
 * @returns true if root key should be fetched, false otherwise
 */
export function shouldFetchRootKey(): boolean {
  return !isProductionEnvironment();
}

/**
 * Gets comprehensive environment information for debugging
 * @returns Object with environment details
 */
export function getEnvironmentInfo() {
  return {
    isProduction: isProductionEnvironment(),
    hostname: window.location.hostname,
    dfxNetwork: import.meta.env.DFX_NETWORK,
    mode: import.meta.env.MODE,
    backendCanisterId: getBackendCanisterId(),
    host: getICHost(),
    shouldFetchRootKey: shouldFetchRootKey(),
  };
}
