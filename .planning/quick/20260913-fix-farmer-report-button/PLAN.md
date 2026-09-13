---
task_id: 20260913-fix-farmer-report-button
title: Fix Missing Next / Submit Button in Farmer Syndromic Report Wizard
status: complete
created_at: 2026-09-13T18:23:00.000Z
completed_at: 2026-09-13T18:26:00.000Z
type: quick
---

# Quick Task: Fix Missing Next / Submit Button in Farmer Syndromic Report Wizard

## Context
The user observed on their mobile screen that there is no button visible to proceed or save in Step 3 of the Farmer Report Wizard (`FarmerReportView` / `ReportWizardView`).
Investigation revealed:
1. In Step 3 of `ReportWizardView.tsx` (line 724), the fixed action bar was set to `z-40` instead of `z-50`.
2. In `App.tsx`, `BottomBar.tsx` also has `z-40` and is rendered after `<main>` in the DOM. Because they share `z-40`, the global BottomBar (`Status | Report | SOS | Doctors | My Animals`) painted directly over the Step 3 action bar, completely hiding the Save/Submit and Back buttons.
3. In Step 1, there was no exit/cancel button if the user wanted to return to the dashboard.

## Objectives
1. Update `mobile/src/views/farmer/ReportWizardView.tsx`:
   - Step 3: Upgrade action bar container to `z-50 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-md` and increase step content padding to `pb-32`.
   - Step 1 & 2: Increase step content padding to `pb-32`, ensure `z-50` and opaque background.
   - Step 1: Add a "Cancel" button to allow farmers to easily exit back to `dashboard`.
2. Update `mobile/src/App.tsx`:
   - Prevent `BottomBar` from rendering when the farmer is actively in `report` tab (`activeRole === 'consumer' && activeTab === 'report'`), eliminating dual-bar conflicts and maximizing vertical screen space.
3. Verify with `npm test`, `npm run build`, and compile debug APK with Gradle.
