import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        className={cn(
          'glass-pill inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-colors',
          {
            'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30': variant === 'primary',
            'text-gray-300': variant === 'secondary',
            'border-transparent bg-transparent hover:bg-white/5': variant === 'ghost',
            'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30': variant === 'danger',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-base': size === 'md',
            'px-8 py-3.5 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
