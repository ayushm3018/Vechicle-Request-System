import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI } from '../../services/api';
import { getUser } from '../../utils/auth';

const VehicleRequestForm = () => {
  const navigate = useNavigate();
  const user = getUser();
  
  const [formData, setFormData] = useState({
    officer_name: user?.name || '',
    designation: user?.designation || '',
    required_date: '',
    required_time: '',
    report_place: '',
    places_to_visit: '',
    journey_purpose: '',
    release_time: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await requestAPI.create(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/employee');
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Request Submitted Successfully!</h2>
          <p className="text-green-800 mb-4">
            Your vehicle requisition request has been submitted and is now pending approval.
            An email notification has been sent to the admin.
          </p>
          <p className="text-green-700">
            Redirecting to dashboard in 2 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Requisition Request</h1>
          <p className="mt-1 text-sm text-gray-600">
            Please fill in all required information for your vehicle request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Officer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="officer_name" className="block text-sm font-medium text-gray-700">
                Name of Officer Requiring Vehicle *
              </label>
              <input
                type="text"
                id="officer_name"
                name="officer_name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.officer_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                Designation *
              </label>
              <input
                type="text"
                id="designation"
                name="designation"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="required_date" className="block text-sm font-medium text-gray-700">
                Date When Vehicle is Required *
              </label>
              <input
                type="date"
                id="required_date"
                name="required_date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.required_date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="required_time" className="block text-sm font-medium text-gray-700">
                Time When Vehicle is Required *
              </label>
              <input
                type="time"
                id="required_time"
                name="required_time"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.required_time}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Report Place */}
          <div>
            <label htmlFor="report_place" className="block text-sm font-medium text-gray-700">
              Place at Which Driver is to Report for Duty *
            </label>
            <textarea
              id="report_place"
              name="report_place"
              rows={2}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter the exact address where driver should report"
              value={formData.report_place}
              onChange={handleChange}
            />
          </div>

          {/* Places to Visit */}
          <div>
            <label htmlFor="places_to_visit" className="block text-sm font-medium text-gray-700">
              Place(s) to be Visited *
            </label>
            <textarea
              id="places_to_visit"
              name="places_to_visit"
              rows={3}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="List all places to be visited during the journey"
              value={formData.places_to_visit}
              onChange={handleChange}
            />
          </div>

          {/* Journey Purpose */}
          <div>
            <label htmlFor="journey_purpose" className="block text-sm font-medium text-gray-700">
              Purpose of Journey *
            </label>
            <textarea
              id="journey_purpose"
              name="journey_purpose"
              rows={3}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Describe the purpose of your journey in detail"
              value={formData.journey_purpose}
              onChange={handleChange}
            />
          </div>

          {/* Release Time */}
          <div>
            <label htmlFor="release_time" className="block text-sm font-medium text-gray-700">
              Time to Release *
            </label>
            <input
              type="time"
              id="release_time"
              name="release_time"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.release_time}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-gray-500">
              Expected time when the vehicle will be released
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/employee')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRequestForm;