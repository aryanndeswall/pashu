import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimalRegistryView } from '../views/AnimalRegistryView';
import { dbService } from '../database/sqliteConnection';
import { animalService } from '../services/animalService';

describe('AnimalRegistryView Component Tests', () => {
  beforeEach(async () => {
    await dbService.initDatabase();
    await animalService.seedDemoAnimalsIfEmpty();
  });

  it('renders "माझे पशु" list with demo animals and summary stats', async () => {
    render(<AnimalRegistryView />);

    // Wait for animals to load
    await waitFor(() => {
      expect(screen.getByText(/पशू आधार पासबुक/i)).toBeDefined();
    });

    // Check stats
    expect(screen.getByText(/एकूण पशु/i)).toBeDefined();
    expect(screen.getAllByText(/लस पूर्ण/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/बूस्टर वेळ/i).length).toBeGreaterThanOrEqual(1);

    // Check demo animals rendered
    await waitFor(() => {
      expect(screen.getByTestId('animal-card-100293847561')).toBeDefined();
      expect(screen.getByTestId('animal-card-100293847562')).toBeDefined();
    });
  });

  it('switches tabs and looks up animal with quick demo pills', async () => {
    render(<AnimalRegistryView />);

    // Switch to Search tab
    const searchTab = screen.getByTestId('tab-tag-lookup');
    fireEvent.click(searchTab);

    // Verify search input is present
    const searchInput = screen.getByTestId('input-search-tag');
    expect(searchInput).toBeDefined();

    // Click quick tag pill for Gir Cow (1002-9384-7561)
    const pill = screen.getByTestId('pill-tag-100293847561');
    fireEvent.click(pill);

    // Verify record found and vaccination timeline rendered
    await waitFor(() => {
      expect(screen.getByText(/पशू आधार रेकॉर्ड सापडले/i)).toBeDefined();
      expect(screen.getByTestId('vaccine-row-FMD')).toBeDefined();
      expect(screen.getByTestId('vaccine-row-LSD')).toBeDefined();
      expect(screen.getByTestId('vaccine-row-ANTHRAX')).toBeDefined();
    });
  });

  it('opens new animal registration modal and registers a new animal', async () => {
    render(<AnimalRegistryView />);

    // Click "+ नवीन नोंदणी"
    const newBtn = screen.getByTestId('btn-open-new-animal');
    fireEvent.click(newBtn);

    // Modal should appear
    expect(screen.getByTestId('new-animal-modal')).toBeDefined();

    // Fill out form
    const tagInput = screen.getByTestId('input-tag-number');
    const ownerNameInput = screen.getByTestId('input-owner-name');
    const ownerMobileInput = screen.getByTestId('input-owner-mobile');
    const submitBtn = screen.getByTestId('btn-submit-registration');

    fireEvent.change(tagInput, { target: { value: '100293847588' } });
    fireEvent.change(ownerNameInput, { target: { value: 'संजय गायकवाड' } });
    fireEvent.change(ownerMobileInput, { target: { value: '9866654321' } });

    fireEvent.click(submitBtn);

    // Verify modal closes and new animal is displayed
    await waitFor(() => {
      expect(screen.queryByTestId('new-animal-modal')).toBeNull();
      expect(screen.getByTestId('animal-card-100293847588')).toBeDefined();
    });
  });
});
