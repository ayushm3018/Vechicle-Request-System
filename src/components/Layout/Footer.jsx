import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              🚗
            </div>
            <span className="font-bold text-lg text-gray-900">
              Vehicle Requisition System
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            © 2024 Vehicle Requisition Management System. All rights reserved.
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            Built with React, Express.js, and MySQL for efficient vehicle management.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;