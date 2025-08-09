import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    requests: { total: 0, pending: 0, approved: 0, rejected: 0 },
    vehicles: { total: 0, available: 0, assigned: 0 },
    recentRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await requestAPI.getDashboardStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner text="Loading dashboard statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error} onRetry={fetchStats} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Vehicle Requisition Management Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  📝
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.requests.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  ⏳
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.requests.pending}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                to="/admin/requests?status=pending"
                className="font-medium text-yellow-700 hover:text-yellow-900"
              >
                View pending requests
              </Link>
            </div>
          </div>
        </div>

        {/* Approved Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  ✅
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.requests.approved}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Rejected Requests */}
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  ❌
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.requests.rejected}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  🚗
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Vehicles</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.vehicles.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  🟢
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.vehicles.available}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  🔴
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">In Use</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.vehicles.assigned}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/requests?status=pending"
            className="bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 transition-colors font-medium text-center"
          >
            ⏳ Review Pending ({stats.requests.pending})
          </Link>
          <Link
            to="/admin/requests"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
          >
            📋 All Requests
          </Link>
          <Link
            to="/admin/vehicles"
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium text-center"
          >
            🚗 Manage Vehicles
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                📊
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {stats.recentRequests} new requests in the last 7 days
                </p>
                <p className="text-xs text-blue-700">
                  System is functioning normally
                </p>
              </div>
            </div>
            <button
              onClick={fetchStats}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;