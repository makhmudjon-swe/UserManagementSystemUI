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
    try {
      await userService.updateUsers({ ids, status });
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