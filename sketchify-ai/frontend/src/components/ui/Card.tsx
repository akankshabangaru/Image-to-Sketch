import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-ink/8 bg-paper-card shadow-sm dark:border-paper/8 dark:bg-graphite-800',
        className
      )}
      {...props}
    />
  );
}
