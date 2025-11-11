import { type User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import type { Role } from '@/shared/constants/roles';
import { auth } from '@/shared/lib/firebase';
import type { User } from '@/shared/types';
import { getEffectiveRole } from '../../rbac/services/effectiveRoleService';
import { userService } from '../services/userService';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  effectiveRole: Role | null;
  hasRoleAssignment: boolean;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to get current authenticated user
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    effectiveRole: null,
    hasRoleAssignment: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // Fetch user profile from Firestore
            const userProfile = await userService.getUserProfile(firebaseUser.uid);

            // Get effective role (checks for active role assignments)
            const effectiveRoleInfo = await getEffectiveRole(firebaseUser.uid);

            setState({
              user: userProfile,
              firebaseUser,
              effectiveRole: effectiveRoleInfo.effectiveRole,
              hasRoleAssignment: effectiveRoleInfo.source === 'assignment',
              loading: false,
              error: null,
            });
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setState({
              user: null,
              firebaseUser,
              effectiveRole: null,
              hasRoleAssignment: false,
              loading: false,
              error: error instanceof Error ? error : new Error('Unknown error'),
            });
          }
        } else {
          setState({
            user: null,
            firebaseUser: null,
            effectiveRole: null,
            hasRoleAssignment: false,
            loading: false,
            error: null,
          });
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setState({
          user: null,
          firebaseUser: null,
          effectiveRole: null,
          hasRoleAssignment: false,
          loading: false,
          error,
        });
      }
    );

    return () => unsubscribe();
  }, []);

  return state;
}
