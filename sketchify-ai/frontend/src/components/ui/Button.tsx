import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
      primary: 'bg-ink text-paper hover:bg-pencil hover:text-ink dark:bg-pencil dark:text-ink dark:hover:bg-pencil-soft',
      secondary: 'bg-paper-card text-ink border border-ink/15 hover:border-pencil hover:text-pencil-deep dark:bg-graphite-800 dark:text-paper dark:border-paper/15 dark:hover:text-pencil',
      ghost: 'text-ink hover:text-pencil-deep dark:text-paper dark:hover:text-pencil',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
