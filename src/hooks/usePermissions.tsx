import { useAuth } from '@/hooks/useAuth';

/**
 * Central permission helper.
 * Admins get full access (create / edit / delete) everywhere.
 * Owners can manage fleet records but not destructive global actions.
 */
export function usePermissions() {
  const { role } = useAuth();

  const isAdmin = role === 'admin';
  const isOwner = role === 'owner';
  const isDriver = role === 'driver';

  return {
    role,
    isAdmin,
    isOwner,
    isDriver,
    canCreate: isAdmin || isOwner || isDriver,
    canEdit: isAdmin || isOwner,
    canDelete: isAdmin,
    canApprove: isAdmin || isOwner,
    canManageAll: isAdmin,
  };
}
