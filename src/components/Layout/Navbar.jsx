import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, isAuthenticated, isAdmin, logout } from '../../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = getUser();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                🚗
              </div>
              <span className="font-bold text-xl text-gray-900">
                Vehicle Requisition
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {authenticated ? (
                <>
                  {isAdmin() ? (
                    <>
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/requests"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        All Requests
                      </Link>
                      <Link
                        to="/admin/vehicles"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Vehicles
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/employee"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/employee/request"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        New Request
                      </Link>
                    </>
                  )}
                  
                  <div className="flex items-center space-x-4 ml-6">
                    <span className="text-sm text-gray-600">
                      Welcome, {user?.name}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
              {authenticated ? (
                <>
                  {isAdmin() ? (
                    <>
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/requests"
                        className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        All Requests
                      </Link>
                      <Link
                        to="/admin/vehicles"
                        className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Vehicles
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/employee"
                        className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/employee/request"
                        className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        New Request
                      </Link>
                    </>
                  )}
                  
                  <div className="border-t border-gray-300 pt-4 pb-3">
                    <div className="flex items-center px-3">
                      <div>
                        <div className="text-base font-medium text-gray-800">{user?.name}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 px-3">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left text-gray-700 hover:text-red-600 block px-0 py-2 rounded-md text-base font-medium transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;