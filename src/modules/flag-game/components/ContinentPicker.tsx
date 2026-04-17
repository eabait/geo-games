import React from 'react';

import { FLAGS } from '../data/flags';
import { CONTINENTS_LIST } from '../data/constants';

interface ContinentPickerProps {
  selected: string;
  onChange: (continent: string) => void;
}

const ACCENT = '#fbbf24';

function countForContinent(continent: string): number {
  if (continent === 'Todos') return FLAGS.length;
  return FLAGS.filter((flag) => flag.continent === continent).length;
}

export function ContinentPicker({ selected, onChange }: ContinentPickerProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 18,
      }}
    >
      {CONTINENTS_LIST.map((continent) => {
        const isSelected = selected === continent;
        return (
          <button
            key={continent}
            onClick={() => onChange(continent)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              border: isSelected ? `1.5px solid ${ACCENT}` : '1px solid rgba(255,255,255,0.1)',
              background: isSelected ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
              color: isSelected ? ACCENT : '#94a3b8',
            }}
          >
            {`${continent} (${countForContinent(continent)})`}
          </button>
        );
      })}
    </div>
  );
}
