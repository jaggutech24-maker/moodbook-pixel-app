/**
 * MoodBook — TabNav
 * Vertical tab navigation on the right edge of the book
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useMoodBookStore, TabId } from '../store/useMoodBookStore';
import { sounds } from '../lib/sounds';

interface TabConfig {
  id: TabId;
  icon: string;
  label: string;
  color: string;
}

const TABS: TabConfig[] = [
  { id: 'draw', icon: '✏️', label: 'Draw', color: '#D8A7B1' },
  { id: 'guess', icon: '🔍', label: 'Guess', color: '#A7C7E7' },
  { id: 'stats', icon: '⭐', label: 'Stats', color: '#F5D6A8' },
  { id: 'history', icon: '📖', label: 'History', color: '#A8D5BA' },
  { id: 'settings', icon: '⚙️', label: 'Settings', color: '#C8A7D8' },
];

export const TabNav: React.FC = () => {
  const { activeTab, setActiveTab } = useMoodBookStore();

  const handleTabClick = (tabId: TabId) => {
    sounds.pageFlip();
    setActiveTab(tabId);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '8px 4px',
        backgroundColor: '#EDD9C8',
        borderLeft: '3px solid #3A2E2A',
        width: '52px',
        alignItems: 'center',
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTabClick(tab.id)}
            title={tab.label}
            style={{
              width: '40px',
              height: '40px',
              border: `${isActive ? '3px' : '2px'} solid #3A2E2A`,
              backgroundColor: isActive ? tab.color : '#FDF4EE',
              boxShadow: isActive ? '0 2px 0 #3A2E2A' : '2px 2px 0 #3A2E2A',
              transform: isActive ? 'translate(2px, 0)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              fontSize: '16px',
              position: 'relative',
              transition: 'all 0.1s',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{tab.icon}</span>
            <span
              style={{
                fontSize: '6px',
                fontFamily: "'Press Start 2P', monospace",
                color: '#3A2E2A',
                letterSpacing: '-0.5px',
              }}
            >
              {tab.label.slice(0, 3).toUpperCase()}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
