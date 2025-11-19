import { useQuery } from '@tanstack/react-query';
import { type User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { userService } from '@/domains/system/features/auth/services/userService';
import { auth } from '@/shared/lib/firebase';
import type { User } from '@/shared/types';

interface UseAuthReturn {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  employeeId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook for authentication state and user profile
 *
 * Uses Firebase Auth for authentication state (realtime subscription)
 * Uses TanStack Query for Firestore user profile (server state)
 */
export function useAuth(): UseAuthReturn {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase Auth state changes (realtime subscription)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch user profile from Firestore using TanStack Query (server state)
  const {
    data: userProfile,
    isLoading: profileLoading,
    error,
  } = useQuery({
    queryKey: ['user', firebaseUser?.uid],
    queryFn: async () => {
      if (!firebaseUser) {
        return null;
      }

      const profile = await userService.getUserProfile(firebaseUser.uid);

      // If profile doesn't exist in Firestore, create a basic one
      if (!profile) {
        console.warn('User profile not found in Firestore, creating basic profile');
        return {
          uid: firebaseUser.uid,
          tenantId: 'default', // Add a default tenantId
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          role: 'employee' as const,
          photoURL: firebaseUser.photoURL || undefined,
          phoneNumber: firebaseUser.phoneNumber || undefined,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      return profile;
    },
    enabled: !!firebaseUser, // Only run query when firebaseUser exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Log errors
  useEffect(() => {
    if (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [error]);

  const loading = authLoading || (!!firebaseUser && profileLoading);

  return {
    user: userProfile || null,
    firebaseUser,
    employeeId: null, // employeeId is not on the user object
    loading,
    isAuthenticated: !!firebaseUser && !!userProfile,
  };
}
