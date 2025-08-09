import React from 'react';
import { getStatusColor, getStatusIcon } from '../../utils/format';

const StatusBadge = ({ status }) => {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      <span className="mr-1">{getStatusIcon(status)}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;