import React from 'react';
import { getInitials } from '../../utils/formatters';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'teal' | 'slate' | 'sky';
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const TONE_CLASSES: Record<NonNullable<AvatarProps['tone']>, string> = {
  teal: 'bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800/80',
  slate: 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  sky: 'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/80',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  tone = 'teal',
}) => {
  return (
    <div
      aria-label={name}
      title={name}
      className={`${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]} shrink-0 rounded-xl border font-display font-bold flex items-center justify-center select-none shadow-xs`}
    >
      {getInitials(name)}
    </div>
  );
};
