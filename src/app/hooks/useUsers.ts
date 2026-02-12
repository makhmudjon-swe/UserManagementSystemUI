import { useState, useEffect } from 'react';
import { userService, User } from '@/app/services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUsers = async (ids: string[], status: 'Unverified' | 'Active' | 'Blocked') => {
    // Validate that IDs are in proper GUID format
    const isValidGuid = (id: string): boolean => {
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return guidRegex.test(id);
    };

    // Filter out invalid IDs
    const validIds = ids.filter(isValidGuid);

    if (validIds.length === 0) {
      throw new Error('No valid user IDs provided');
    }

    // Convert string status to numeric value
    const statusMap: Record<'Unverified' | 'Active' | 'Blocked', number> = {
      'Unverified': 0,
      'Active': 1,
      'Blocked': 2
    };

    const numericStatus = statusMap[status];

    try {
      await userService.updateUsers({ ids: validIds, status: numericStatus });
      await fetchUsers(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to update users');
    }
  };

  const deleteUsers = async (ids: string[]) => {
    try {
      await userService.deleteUsers({ ids });
      await fetchUsers(); // Refresh the list
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete users');
    }
  };

  const deleteUnverifiedUsers = async () => {
    try {
      const response = await userService.deleteUnverifiedUsers();
      await fetchUsers(); // Refresh the list
      return response;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete unverified users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUsers,
    deleteUsers,
    deleteUnverifiedUsers,
  };
};