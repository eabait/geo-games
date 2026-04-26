import React from 'react';

import { FLAGS } from '../data/flags';
import { CONTINENTS_LIST } from '../data/constants';
import type { Continent } from '../types';

import styles from './ContinentPicker.module.css';

type ContinentFilter = Continent | 'Todos';

interface ContinentPickerProps {
  selected: ContinentFilter;
  onChange: (continent: ContinentFilter) => void;
}

function countForContinent(continent: ContinentFilter): number {
  if (continent === 'Todos') return FLAGS.length;
  return FLAGS.filter((flag) => flag.continent === continent).length;
}

export function ContinentPicker({ selected, onChange }: ContinentPickerProps): React.JSX.Element {
  return (
    <div className={styles.container}>
      {(CONTINENTS_LIST as ContinentFilter[]).map((continent) => {
        const isSelected = selected === continent;
        const className = [styles.button, isSelected ? styles.selected : '']
          .filter(Boolean)
          .join(' ');

        return (
          <button
            aria-pressed={isSelected}
            className={className}
            key={continent}
            onClick={() => onChange(continent)}
            type="button"
          >
            {`${continent} (${countForContinent(continent)})`}
          </button>
        );
      })}
    </div>
  );
}
