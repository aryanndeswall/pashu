import React from 'react';
import { useAuthStore } from '../store/authStore';
import { FarmerAnimalsView } from './farmer/FarmerAnimalsView';
import { VetAnimalRegistryView } from './vet/VetAnimalRegistryView';
import { AdminCensusView } from './admin/AdminCensusView';

export const AnimalRegistryView: React.FC = () => {
  const activeRole = useAuthStore((state) => state.activeRole);

  if (activeRole === 'admin') {
    return <AdminCensusView />;
  }
  if (activeRole === 'doctor') {
    return <VetAnimalRegistryView />;
  }
  return <FarmerAnimalsView />;
};

export default AnimalRegistryView;
