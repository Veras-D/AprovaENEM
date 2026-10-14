import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly variant?: 'default' | 'elevated' | 'bordered';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const baseStyles = 'rounded-brand transition-all overflow-hidden';
    const variants = {
      default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm',
      elevated: 'bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800',
      bordered: 'bg-transparent border-2 border-slate-300 dark:border-slate-700',
    };

    return (
      <div ref={ref} className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={twMerge(clsx('p-5 border-b border-slate-100 dark:border-slate-800', className))} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => <div className={twMerge(clsx('p-5', className))} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={twMerge(clsx('p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800', className))} {...props}>
    {children}
  </div>
);
