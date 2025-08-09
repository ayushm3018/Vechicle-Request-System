import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { requestAPI, vehicleAPI } from '../../services/api';
import { formatDate, formatTime, formatDateTime } from '../../utils/format';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import StatusBadge from '../../components/Common/StatusBadge';

const RequestManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  const statusFilter = searchParams.get('status') || '';
  const currentPage = parseInt(searchParams.get('page')) || 1;
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: 10
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }
      
      const response = await requestAPI.getAll(params);
      setRequests(response.data.requests);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAvailable();
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchVehicles();
  }, [statusFilter, currentPage]);

  const handleStatusFilter = (status) => {
    const newParams = new URLSearchParams(searchParams);
    if (status) {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
  };

  const handleApprove = async (request) => {
    if (!selectedVehicle) {
      alert('Please select a vehicle to assign');
      return;
    }

    try {
      setActionLoading(request.id);
      await requestAPI.approve(request.id, selectedVehicle);
      
      // Refresh data
      await fetchRequests();
      await fetchVehicles();
      
      // Reset modal
      setSelectedRequest(null);
      setSelectedVehicle('');
      
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(request.id);
      await requestAPI.reject(request.id, rejectionReason);
      
      // Refresh data
      await fetchRequests();
      
      // Reset modal
      setSelectedRequest(null);
      setRejectionReason('');
      
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const getSelectedVehicleInfo = () => {
    return vehicles.find(v => v.id.toString() === selectedVehicle);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Request Management</h1>
        <p className="mt-2 text-gray-600">Review and manage vehicle requisition requests</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !statusFilter 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => handleStatusFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleStatusFilter('approved')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'approved' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => handleStatusFilter('rejected')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && <LoadingSpinner text="Loading requests..." />}
      
      {error && <ErrorMessage message={error} onRetry={fetchRequests} />}

      {/* Requests Table */}
      {!loading && !error && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p>No requests found for the selected filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Information
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Journey Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.employee_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.employee_email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.designation}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              📅 {formatDate(request.required_date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              🕒 {formatTime(request.required_time)} - {formatTime(request.release_time)}
                            </div>
                            <div className="text-sm text-gray-500">
                              📍 {request.report_place}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Submitted: {formatDateTime(request.created_at)}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.journey_purpose}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              📍 {request.places_to_visit}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={request.status} />
                          
                          {request.vehicle_number && (
                            <div className="mt-2 text-xs text-gray-500">
                              🚗 {request.vehicle_number}
                              <br />
                              {request.make_model}
                              <br />
                              Driver: {request.driver_name}
                            </div>
                          )}
                          
                          {request.status === 'rejected' && request.rejection_reason && (
                            <div className="mt-2 text-xs text-red-600">
                              Reason: {request.rejection_reason}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setSelectedVehicle('');
                                }}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setRejectionReason('');
                                }}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                          
                          {request.status !== 'pending' && (
                            <span className="text-gray-400 text-xs">
                              {request.status === 'approved' ? 'Approved' : 'Rejected'}
                              {request.approved_by_name && (
                                <div>by {request.approved_by_name}</div>
                              )}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">
                            {(pagination.page - 1) * pagination.limit + 1}
                          </span>{' '}
                          to{' '}
                          <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                          </span>{' '}
                          of <span className="font-medium">{pagination.total}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ←
                          </button>
                          
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.page
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            →
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Approve Modal */}
      {selectedRequest && selectedRequest.status === 'pending' && !rejectionReason && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Approve Vehicle Request
              </h3>
              
              {/* Request Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Request Details:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Employee:</strong> {selectedRequest.employee_name}</p>
                  <p><strong>Date:</strong> {formatDate(selectedRequest.required_date)}</p>
                  <p><strong>Time:</strong> {formatTime(selectedRequest.required_time)} - {formatTime(selectedRequest.release_time)}</p>
                  <p><strong>Purpose:</strong> {selectedRequest.journey_purpose}</p>
                </div>
              </div>
              
              {/* Vehicle Selection */}
              <div className="mb-4">
                <label htmlFor="vehicle-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vehicle to Assign *
                </label>
                <select
                  id="vehicle-select"
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} - {vehicle.make_model}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Selected Vehicle Details */}
              {selectedVehicle && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-green-900 mb-2">Selected Vehicle Details:</h4>
                  <div className="text-sm text-green-800">
                    {(() => {
                      const vehicleInfo = getSelectedVehicleInfo();
                      return vehicleInfo ? (
                        <div>
                          <p><strong>Vehicle Number:</strong> {vehicleInfo.vehicle_number}</p>
                          <p><strong>Make/Model:</strong> {vehicleInfo.make_model}</p>
                          <p><strong>Driver:</strong> {vehicleInfo.driver_name}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedVehicle('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={!selectedVehicle || actionLoading === selectedRequest.id}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedRequest.id ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Approving...
                    </div>
                  ) : (
                    'Approve Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedRequest && rejectionReason !== null && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Vehicle Request
              </h3>
              
              {/* Request Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Request Details:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Employee:</strong> {selectedRequest.employee_name}</p>
                  <p><strong>Date:</strong> {formatDate(selectedRequest.required_date)}</p>
                  <p><strong>Purpose:</strong> {selectedRequest.journey_purpose}</p>
                </div>
              </div>
              
              {/* Rejection Reason */}
              <div className="mb-4">
                <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  id="rejection-reason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejecting this request..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest)}
                  disabled={!rejectionReason.trim() || actionLoading === selectedRequest.id}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedRequest.id ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Rejecting...
                    </div>
                  ) : (
                    'Reject Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestManagement;