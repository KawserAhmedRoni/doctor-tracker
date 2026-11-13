import React, { useState } from 'react';
import { getInitials } from '../../utils/formatters';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'teal' | 'slate' | 'sky';
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-7 w-7 text-[11px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const TONE_CLASSES: Record<NonNullable<AvatarProps['tone']>, string> = {
  teal: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/80',
  slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  sky: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/80',
};

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  tone = 'teal',
}) => {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${SIZE_CLASSES[size]} shrink-0 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]} shrink-0 rounded-lg border font-display font-semibold flex items-center justify-center select-none`}
    >
      {getInitials(name)}
    </div>
  );
};
