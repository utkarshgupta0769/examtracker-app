import { useInternetIdentity } from './useInternetIdentity';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type backendInterface } from '../backend';
import { createActorWithConfig } from '../config';
import { getSecretParameter } from '../utils/urlParams';
import { isProductionEnvironment, getEnvironmentInfo, getBackendCanisterId, getICHost, shouldFetchRootKey } from '../utils/canisterEnv';
import { HttpAgent } from '@dfinity/agent';

const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds
const ACTOR_QUERY_KEY = 'actor';

export function useActorWithStatus() {
  const { identity, loginStatus, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAuthStateRef = useRef<string | null>(null);

  // Use the query directly to get access to all properties
  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      // Log environment info for debugging
      const envInfo = getEnvironmentInfo();
      console.log('Actor initialization - Environment:', envInfo);

      const isAuthenticated = !!identity;
      const host = getICHost();
      
      // Get canister ID from environment
      const canisterId = getBackendCanisterId();
      
      if (!canisterId) {
        console.error('Backend canister ID not found. Please ensure environment variables are properly configured.');
        throw new Error(
          'Backend canister ID not configured. ' +
          'Please check that the canister is deployed and environment variables are set correctly.'
        );
      }

      // Create agent options
      const agentOptions: any = {
        host,
      };

      // Add identity if authenticated
      if (isAuthenticated) {
        agentOptions.identity = identity;
      }

      // Create the actor with proper configuration
      let actor: backendInterface;
      
      try {
        // Try to use the config's createActorWithConfig if it supports our options
        actor = await createActorWithConfig({
          agentOptions,
        });
        
        // Fetch root key for local development
        if (shouldFetchRootKey() && actor) {
          const agent = (actor as any)._agent as HttpAgent;
          if (agent && typeof agent.fetchRootKey === 'function') {
            try {
              await agent.fetchRootKey();
              console.log('Root key fetched successfully for local development');
            } catch (err) {
              console.warn('Failed to fetch root key:', err);
            }
          }
        }
      } catch (error) {
        console.error('Failed to create actor with config:', error);
        throw new Error(
          `Failed to initialize backend connection: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
          `Environment: ${isProductionEnvironment() ? 'Production' : 'Local'}, ` +
          `Canister ID: ${canisterId}`
        );
      }

      // Initialize access control if authenticated
      if (isAuthenticated && actor) {
        try {
          const adminToken = getSecretParameter('caffeineAdminToken') || '';
          await actor._initializeAccessControlWithSecret(adminToken);
          console.log('Access control initialized successfully');
        } catch (error) {
          console.warn('Failed to initialize access control:', error);
          // Don't throw here - access control initialization failure shouldn't prevent actor usage
        }
      }

      return actor;
    },
    staleTime: Infinity,
    enabled: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        }
      });
    }
  }, [actorQuery.data, queryClient]);

  // Calculate exponential backoff delay
  const getRetryDelay = useCallback((attempt: number): number => {
    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }, []);

  // Manual retry function
  const retry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    console.log('Manual retry triggered - Environment:', getEnvironmentInfo());
    
    setIsRetrying(true);
    
    // Invalidate actor query to force refetch
    queryClient.invalidateQueries({ queryKey: [ACTOR_QUERY_KEY] });
    
    // Also invalidate all dependent queries
    queryClient.invalidateQueries({
      predicate: (query) => !query.queryKey.includes(ACTOR_QUERY_KEY),
    });
    
    // Trigger the query's refetch
    actorQuery.refetch();
    
    setRetryCount(prev => prev + 1);
    
    // Reset retrying state after a short delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 500);
  }, [queryClient, actorQuery]);

  // Automatic retry with exponential backoff
  const scheduleRetry = useCallback((attempt: number) => {
    if (attempt >= MAX_RETRY_ATTEMPTS) {
      const envInfo = getEnvironmentInfo();
      setIsRetrying(false);
      return;
    }

    const delay = getRetryDelay(attempt);
    
    retryTimeoutRef.current = setTimeout(() => {
      console.log(`Auto-retrying actor initialization (attempt ${attempt + 1}/${MAX_RETRY_ATTEMPTS})...`);
      retry();
    }, delay);
  }, [getRetryDelay, retry]);

  // Monitor actor initialization status
  useEffect(() => {
    // Don't check if still initializing auth
    if (isInitializing) {
      return;
    }

    // Clear any pending retries
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // If we have an actor, clear retry count
    if (actorQuery.data) {
      setRetryCount(0);
      setIsRetrying(false);
      return;
    }

    // If not fetching and no actor and there's an error, schedule retry
    if (!actorQuery.isFetching && !actorQuery.data && actorQuery.isError && !isRetrying) {
      // Only retry if we're authenticated or login completed
      if (identity || loginStatus === 'success') {
        console.warn('Actor initialization failed, scheduling retry...');
        scheduleRetry(retryCount);
      }
    }
  }, [actorQuery.data, actorQuery.isFetching, actorQuery.isError, identity, loginStatus, isInitializing, retryCount, isRetrying, scheduleRetry]);

  // Monitor authentication state changes and trigger reconnection
  useEffect(() => {
    const currentAuthState = identity?.getPrincipal().toString() || 'anonymous';
    
    // If auth state changed, reset error and retry
    if (lastAuthStateRef.current !== null && lastAuthStateRef.current !== currentAuthState) {
      console.log('Authentication state changed, reinitializing actor...');
      console.log('Environment info:', getEnvironmentInfo());
      
      setRetryCount(0);
      setIsRetrying(false);
      
      // Clear any pending retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      // Force actor reinitialization
      queryClient.invalidateQueries({ queryKey: [ACTOR_QUERY_KEY] });
    }
    
    lastAuthStateRef.current = currentAuthState;
  }, [identity, queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Create error with helpful message
  const error = actorQuery.error ? (
    actorQuery.error instanceof Error 
      ? actorQuery.error 
      : new Error(String(actorQuery.error))
  ) : null;

  const enhancedError = error ? new Error(
    isProductionEnvironment()
      ? `Failed to connect to backend canister. Please verify the canister is deployed and accessible. ${error.message}`
      : `Failed to connect to local backend. Please ensure 'dfx start' is running and the canister is deployed. ${error.message}`
  ) : null;

  const isError = actorQuery.isError && !actorQuery.isFetching && !isRetrying;
  const isConnecting = actorQuery.isFetching || isRetrying;

  return {
    actor: actorQuery.data || null,
    isFetching: isConnecting,
    isError,
    error: enhancedError,
    retryCount: retryCount + actorQuery.failureCount,
    retry,
    isRetrying,
  };
}
