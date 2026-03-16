import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Custom hook to access the auth context.
 * Throws an error if used outside AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. Check your component tree.'
    );
  }
  return context;
};

