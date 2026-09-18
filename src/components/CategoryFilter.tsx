'use client';

import React from 'react';
import {
  Layers,
  Briefcase,
  User,
  Code2,
  Palette,
  Server,
  ShoppingCart,
  HeartPulse,
  Tag,
} from 'lucide-react';
import styles from './CategoryFilter.module.css';
import { sound } from '@/lib/sound';

interface CategoryFilterProps {
  categories: { name: string; count: number }[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <Layers size={15} />,
  Work: <Briefcase size={15} />,
  Personal: <User size={15} />,
  Development: <Code2 size={15} />,
  Design: <Palette size={15} />,
  DevOps: <Server size={15} />,
  Shopping: <ShoppingCart size={15} />,
  Health: <HeartPulse size={15} />,
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <nav className={styles.scrollWrapper} aria-label="Task categories">
      <div className={styles.container}>
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          const icon = CATEGORY_ICONS[cat.name] || <Tag size={15} />;

          return (
            <button
              key={cat.name}
              className={`${styles.categoryPill} ${isSelected ? styles.selected : ''}`}
              onClick={() => {
                sound.playTap();
                onSelectCategory(cat.name);
              }}
              aria-pressed={isSelected}
            >
              <span className={styles.pillIcon}>{icon}</span>
              <span className={styles.pillText}>{cat.name}</span>
              <span className={styles.pillCount}>{cat.count}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
