/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UITemplateId = 'standard' | 'high_density' | 'luxury_obsidian' | 'touch_pos';

export interface UITemplateConfig {
  id: UITemplateId;
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  badge: string;
  bestFor: string;
  density: 'standard' | 'compact' | 'relaxed';
  fontStyle: string;
}

export const UI_TEMPLATES: UITemplateConfig[] = [
  {
    id: 'standard',
    name: 'Standard Hospitality ERP',
    tagline: 'Balanced & Modern Luxury',
    description: 'The flagship Grand Vista hospitality interface. Elegant emerald accents, generous spacing, high legibility, and refined card elevations.',
    accentColor: '#059669', // Emerald 600
    badge: 'Default Theme',
    bestFor: 'General hotel management, executive review, and standard operations.',
    density: 'standard',
    fontStyle: 'Modern Sans',
  },
  {
    id: 'high_density',
    name: 'Opera Classic / High-Density Desk',
    tagline: 'Ultra-Compact Front Desk Terminal',
    description: 'High-information density inspired by classic PMS terminals (Opera/Protel). Tight tabular rows, monospace room tags, sharp high-contrast grid borders, minimal scrolling.',
    accentColor: '#2563eb', // Royal Blue
    badge: 'Fast Check-in',
    bestFor: 'Front desk receptionists, night auditors, and high-volume reservation clerks.',
    density: 'compact',
    fontStyle: 'Dense Monospace Accents',
  },
  {
    id: 'luxury_obsidian',
    name: 'Midnight Obsidian & Champagne',
    tagline: 'Boutique Luxury Dark Lounge',
    description: 'Deep midnight obsidian tones, warm bronze and champagne gold highlights, subtle glassmorphism borders, and ambient evening atmosphere.',
    accentColor: '#d97706', // Amber / Champagne Gold
    badge: 'VIP Concierge',
    bestFor: 'Boutique suites, VIP concierge desks, evening shifts, and executive club lounges.',
    density: 'relaxed',
    fontStyle: 'Refined Luxury',
  },
  {
    id: 'touch_pos',
    name: 'Touch POS & Tablet Station',
    tagline: 'Oversized Tactile POS Mode',
    description: 'Engineered for tablet touchscreens, bar counters, and restaurant servers. Large tactile buttons, oversized touch targets, bold color-coded status tiles, high contrast.',
    accentColor: '#ea580c', // Vibrant Orange
    badge: 'Touch Optimized',
    bestFor: 'Restaurant order stations, poolside bar terminals, and self-service kiosks.',
    density: 'relaxed',
    fontStyle: 'Bold Display',
  },
];

interface UITemplateContextType {
  currentTemplate: UITemplateId;
  templateConfig: UITemplateConfig;
  setTemplate: (templateId: UITemplateId) => void;
  isTemplateModalOpen: boolean;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;
}

const UITemplateContext = createContext<UITemplateContextType | undefined>(undefined);

export const UITemplateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTemplate, setCurrentTemplateState] = useState<UITemplateId>(() => {
    try {
      const saved = localStorage.getItem('grandvista_pms_ui_template');
      if (saved && UI_TEMPLATES.some((t) => t.id === saved)) {
        return saved as UITemplateId;
      }
    } catch {
      // ignore
    }
    return 'standard';
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const setTemplate = (templateId: UITemplateId) => {
    setCurrentTemplateState(templateId);
    try {
      localStorage.setItem('grandvista_pms_ui_template', templateId);
    } catch {
      // ignore
    }
  };

  // Sync DOM classes whenever currentTemplate changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove old template classes
    UI_TEMPLATES.forEach((t) => {
      root.classList.remove(`theme-${t.id}`);
      body.classList.remove(`theme-${t.id}`);
    });

    // Add active template class
    root.classList.add(`theme-${currentTemplate}`);
    body.classList.add(`theme-${currentTemplate}`);

    // If luxury obsidian is selected, encourage dark mode
    if (currentTemplate === 'luxury_obsidian') {
      root.classList.add('dark');
    }
  }, [currentTemplate]);

  const templateConfig = UI_TEMPLATES.find((t) => t.id === currentTemplate) || UI_TEMPLATES[0];

  return (
    <UITemplateContext.Provider
      value={{
        currentTemplate,
        templateConfig,
        setTemplate,
        isTemplateModalOpen,
        openTemplateModal: () => setIsTemplateModalOpen(true),
        closeTemplateModal: () => setIsTemplateModalOpen(false),
      }}
    >
      {children}
    </UITemplateContext.Provider>
  );
};

export const useUITemplate = (): UITemplateContextType => {
  const context = useContext(UITemplateContext);
  if (!context) {
    throw new Error('useUITemplate must be used within a UITemplateProvider');
  }
  return context;
};
