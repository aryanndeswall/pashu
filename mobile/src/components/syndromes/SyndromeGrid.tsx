import React from 'react';
import { SyndromeDefinition, SYNDROME_TAXONOMY } from '../../types/syndromes';
import { SyndromeCard } from './SyndromeCard';

interface SyndromeGridProps {
  selectedSyndrome?: SyndromeDefinition | null;
  onSelectSyndrome: (syndrome: SyndromeDefinition) => void;
  filterQuery?: string;
}

export const SyndromeGrid: React.FC<SyndromeGridProps> = ({
  selectedSyndrome,
  onSelectSyndrome,
  filterQuery = '',
}) => {
  const filteredSyndromes = SYNDROME_TAXONOMY.filter((syn) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      syn.code.toLowerCase().includes(q) ||
      syn.nameEnglish.toLowerCase().includes(q) ||
      syn.nameMarathi.includes(q) ||
      syn.colloquialMarathi.includes(q) ||
      syn.commonSuspects.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="grid grid-cols-2 gap-3.5 pb-6">
      {filteredSyndromes.map((syndrome) => (
        <SyndromeCard
          key={syndrome.code}
          syndrome={syndrome}
          isSelected={selectedSyndrome?.code === syndrome.code}
          onSelect={onSelectSyndrome}
        />
      ))}
    </div>
  );
};
