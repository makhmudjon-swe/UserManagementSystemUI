import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Unlock, Trash2, UserX, ChevronDown, Loader2 } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useAuth } from '@/app/context/AuthContext';
import { useUsers } from '@/app/hooks/useUsers';
import { toast } from 'sonner';

export function AdminPanel() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { users: apiUsers, loading, error, updateUsers, deleteUsers, deleteUnverifiedUsers } = useUsers();
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [filterText, setFilterText] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const currentUserEmail = 'admin@example.com'; 
  const transformedUsers = useMemo(() => {
    return apiUsers.map(user => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      status: user.status,
      lastSeen: user.lastLoginAt 
        ? new Date(user.lastLoginAt).toLocaleString() 
        : 'Never'
    }));
  }, [apiUsers]);
  const filteredUsers = useMemo(() => {
    if (!filterText) return transformedUsers;
    const lowerFilter = filterText.toLowerCase();
    return transformedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerFilter) ||
        user.email.toLowerCase().includes(lowerFilter) ||
        user.status.toLowerCase().includes(lowerFilter)
    );
  }, [transformedUsers, filterText]);

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      const aTime = a.lastSeen === 'Never' ? 0 : new Date(a.lastSeen).getTime();
      const bTime = b.lastSeen === 'Never' ? 0 : new Date(b.lastSeen).getTime();
      return sortDirection === 'desc' ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [filteredUsers, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedUsers.slice(start, start + rowsPerPage);
  }, [sortedUsers, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedUsers.length / rowsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(paginatedUsers.map((u) => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelection = new Set(selectedUserIds);
    if (checked) {
      newSelection.add(userId);
    } else {
      newSelection.delete(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const handleBlock = async () => {
    if (selectedUserIds.size === 0) {
      toast.warning('Please select users to block');
      return;
    }
    setActionLoading(true);
    try {
      const ids = Array.from(selectedUserIds);
      await updateUsers(ids, 'Blocked');
      toast.success(`${ids.length} user${ids.length > 1 ? 's' : ''} blocked successfully`);
      setSelectedUserIds(new Set());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (selectedUserIds.size === 0) {
      toast.warning('Please select users to unblock');
      return;
    }
    setActionLoading(true);
    try {
      const ids = Array.from(selectedUserIds);
      await updateUsers(ids, 'Active');
      toast.success(`${ids.length} user${ids.length > 1 ? 's' : ''} unblocked successfully`);
      setSelectedUserIds(new Set());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedUserIds.size === 0) {
      toast.warning('Please select users to delete');
      return;
    }
    setActionLoading(true);
    try {
      const ids = Array.from(selectedUserIds);
      await deleteUsers(ids);
      toast.success(`${ids.length} user${ids.length > 1 ? 's' : ''} deleted successfully`);
      setSelectedUserIds(new Set());
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUnverified = async () => {
    setActionLoading(true);
    try {
      const response = await deleteUnverifiedUsers();
      if (response.count > 0) {
        toast.success(`${response.count} unverified user${response.count > 1 ? 's' : ''} deleted successfully`);
      } else {
        toast.info('No unverified users found');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isAllSelected = paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUserIds.has(u.id));
  const isSomeSelected = paginatedUsers.some((u) => selectedUserIds.has(u.id));

  return (
    <Tooltip.Provider>
      <div className="min-h-screen flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-card border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between">
          <h3 className="m-0">User Management System</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{currentUserEmail}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm border border-border bg-card text-foreground rounded hover:bg-muted transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="mb-4 sm:mb-6">Users</h1>

            {/* Loading indicator */}
            {loading && (
              <div className="mb-4 p-3 bg-accent border border-border rounded flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-foreground">Loading users...</span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                Error: {error}
              </div>
            )}

            {/* Toolbar */}
            <div className="mb-4 p-3 sm:p-4 bg-card border border-border rounded flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex gap-2 items-center flex-wrap">
                <button
                  onClick={handleBlock}
                  disabled={selectedUserIds.size === 0 || actionLoading}
                  className="px-3 py-1.5 text-sm border border-border bg-card text-foreground rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Block
                </button>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={handleUnblock}
                      disabled={selectedUserIds.size === 0 || actionLoading}
                      className="px-2 py-1.5 border border-border bg-card text-foreground rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Unblock"
                    >
                      <Unlock className="w-4 h-4" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg"
                      sideOffset={5}
                    >
                      Unblock
                      <Tooltip.Arrow className="fill-foreground" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={handleDelete}
                      disabled={selectedUserIds.size === 0 || actionLoading}
                      className="px-2 py-1.5 border border-border bg-card text-foreground rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg"
                      sideOffset={5}
                    >
                      Delete
                      <Tooltip.Arrow className="fill-foreground" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={handleDeleteUnverified}
                      disabled={actionLoading}
                      className="px-2 py-1.5 border border-border bg-card text-foreground rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Delete unverified"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg"
                      sideOffset={5}
                    >
                      Delete unverified
                      <Tooltip.Arrow className="fill-foreground" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </div>

              <div className="sm:ml-auto w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Filter"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full sm:w-48 px-3 py-1.5 text-sm border border-input bg-input-background rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Table - Desktop */}
            <div className="hidden md:block bg-card border border-border rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left p-3 w-12">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = !isAllSelected && isSomeSelected;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="text-left p-3 text-sm">Name</th>
                      <th className="text-left p-3 text-sm">Email</th>
                      <th className="text-left p-3 text-sm">Status</th>
                      <th
                        className="text-left p-3 text-sm cursor-pointer select-none hover:bg-accent/50"
                        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      >
                        <div className="flex items-center gap-1">
                          Last seen
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              sortDirection === 'asc' ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`border-b border-border hover:bg-accent/30 transition-colors ${
                          index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.has(user.id)}
                            onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-sm">{user.name}</td>
                        <td className="p-3 text-sm">{user.email}</td>
                        <td className="p-3 text-sm">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs ${
                              user.status === 'Active'
                                ? 'bg-accent text-foreground'
                                : user.status === 'Blocked'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{user.lastSeen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table - Mobile (Card View) */}
            <div className="md:hidden space-y-3">
              {paginatedUsers.map((user) => (
                <div key={user.id} className="bg-card border border-border rounded p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.has(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="w-4 h-4 cursor-pointer mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1">{user.name}</div>
                      <div className="text-sm text-muted-foreground mb-2 break-all">{user.email}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`inline-block px-2 py-0.5 rounded ${
                            user.status === 'Active'
                              ? 'bg-accent text-foreground'
                              : user.status === 'Blocked'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {user.status}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{user.lastSeen}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 border border-input bg-input-background rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-border bg-card rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-border bg-card rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
