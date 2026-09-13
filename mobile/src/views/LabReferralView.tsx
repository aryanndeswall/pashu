import React from 'react';
import { useAuthStore } from '../store/authStore';
import { VetLabReferralView } from './vet/VetLabReferralView';
import { AdminLabAuditView } from './admin/AdminLabAuditView';

export const LabReferralView: React.FC = () => {
  const activeRole = useAuthStore((state) => state.activeRole);

  if (activeRole === 'admin') {
    return <AdminLabAuditView />;
  }
  return <VetLabReferralView />;
};

export default LabReferralView;
