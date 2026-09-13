import React from 'react';
import { useAuthStore } from '../store/authStore';
import { FarmerDashboardView } from './farmer/FarmerDashboardView';
import { VetDashboardView } from './vet/VetDashboardView';
import { AdminDashboardView } from './admin/AdminDashboardView';

/**
 * Universal DashboardView wrapper that resolves to the role-specific dashboard:
 * - consumer -> FarmerDashboardView
 * - doctor   -> VetDashboardView
 * - admin    -> AdminDashboardView
 */
export const DashboardView: React.FC = () => {
  const activeRole = useAuthStore((state) => state.activeRole);

  if (activeRole === 'admin') {
    return <AdminDashboardView />;
  }
  if (activeRole === 'doctor') {
    return <VetDashboardView />;
  }
  return <FarmerDashboardView />;
};

export default DashboardView;
