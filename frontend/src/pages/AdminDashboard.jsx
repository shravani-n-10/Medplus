import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    activeUsers: 0,
    totalImages: 0
  });
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [filterStatus]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get(`/api/admin/users?status=${filterStatus}`),
        axios.get('/api/admin/audit-logs')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setAuditLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/approve`);
      fetchAdminData();
    } catch (err) {
      alert('Approval failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/reject`);
      fetchAdminData();
    } catch (err) {
      alert('Rejection failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header Summary */}
      <div className="bg-[#F5EBE0] rounded-xl shadow-md border border-[#C4A482] p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold text-[#1E0A00]">Admin Control Dashboard</h1>
          <p className="text-xs text-[#5C2800] mt-1 font-semibold">
            Authorization & User Management Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#E8D5C4] border border-[#C4A482] rounded-lg text-center">
            <span className="text-[10px] text-[#C27803] font-bold uppercase block">Pending</span>
            <span className="text-lg font-bold text-[#C27803]">{stats.pendingUsers}</span>
          </div>
          <div className="px-4 py-2 bg-[#E8D5C4] border border-[#C4A482] rounded-lg text-center">
            <span className="text-[10px] text-[#2E7D46] font-bold uppercase block">Active Users</span>
            <span className="text-lg font-bold text-[#2E7D46]">{stats.activeUsers}</span>
          </div>
          <div className="px-4 py-2 bg-[#E8D5C4] border border-[#C4A482] rounded-lg text-center">
            <span className="text-[10px] text-[#853E04] font-bold uppercase block">Total Encryptions</span>
            <span className="text-lg font-bold text-[#853E04]">{stats.totalImages}</span>
          </div>
        </div>
      </div>

      {/* Users Approval Table */}
      <div className="bg-[#F5EBE0] rounded-xl shadow-md border border-[#C4A482] p-6 animate-slide-up">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#1E0A00]">User Approvals</h3>
          
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1 rounded font-semibold transition ${filterStatus === 'pending' ? 'bg-[#853E04] text-[#F5EBE0]' : 'bg-[#DFCCB7] text-[#1E0A00]'}`}
            >
              Pending ({stats.pendingUsers})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded font-semibold transition ${filterStatus === 'active' ? 'bg-[#853E04] text-[#F5EBE0]' : 'bg-[#DFCCB7] text-[#1E0A00]'}`}
            >
              Active ({stats.activeUsers})
            </button>
            <button
              onClick={() => setFilterStatus('')}
              className={`px-3 py-1 rounded font-semibold transition ${filterStatus === '' ? 'bg-[#853E04] text-[#F5EBE0]' : 'bg-[#DFCCB7] text-[#1E0A00]'}`}
            >
              All
            </button>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5C2800]">
            No users match selected filter.
          </div>
        ) : (
          <table className="w-full text-left text-xs text-[#1E0A00]">
            <thead className="bg-[#DFCCB7] uppercase text-[10px] text-[#5C2800] font-semibold border-b border-[#C4A482]">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Registered At</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFCCB7]">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-[#E8D5C4] transition">
                  <td className="p-3 font-semibold text-[#1E0A00]">{u.name}</td>
                  <td className="p-3 font-mono">{u.email}</td>
                  <td className="p-3 uppercase font-bold text-[10px]">
                    <span className={u.status === 'active' ? 'text-[#2E7D46]' : u.status === 'pending' ? 'text-[#C27803]' : 'text-rose-700'}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[#5C2800]">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    {u.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(u._id)}
                          className="btn-green text-xs px-3 py-1 font-bold transition transform hover:scale-105"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(u._id)}
                          className="bg-rose-700 hover:bg-rose-800 text-white text-xs px-3 py-1 font-bold rounded transition transform hover:scale-105"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Security Audit Feed */}
      <div className="bg-[#F5EBE0] rounded-xl shadow-md border border-[#C4A482] p-6 animate-slide-up">
        <h3 className="text-base font-bold text-[#1E0A00] mb-3">Security Audit Feed</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div key={log._id} className="p-2.5 bg-[#DFCCB7] border border-[#C4A482] rounded text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1E0A00]">{log.action}:</span> <span className="text-[#2E1200]">{log.details}</span>
              </div>
              <span className="text-[10px] text-[#5C2800] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
