import React from 'react';
import { useAuthStore } from '../store/authStore';
import { FarmerReportView } from './farmer/FarmerReportView';
import { AdminReportsView } from './admin/AdminReportsView';

export const ReportView: React.FC = () => {
  const activeRole = useAuthStore((state) => state.activeRole);

  if (activeRole === 'admin') {
    return <AdminReportsView />;
  }
  return <FarmerReportView />;
};

export default ReportView;
