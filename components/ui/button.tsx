import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button cursor-pointer inline-flex shrink-0 items-center justify-center rounded-lg border font-semibold whitespace-nowrap transition-colors duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          'bg-navy text-white border-transparent hover:bg-navy-light',
        accent:
          'bg-crimson text-white border-transparent hover:bg-crimson-light',
        wellness:
          'bg-sage text-white border-transparent hover:bg-sage-light',
        outline:
          'border-border bg-background text-foreground hover:bg-muted',
        ghost:
          'border-transparent text-foreground hover:bg-muted',
        destructive:
          'bg-destructive text-destructive-foreground border-transparent hover:bg-crimson-dark',
        link:
          'border-transparent text-navy underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 gap-1.5 px-4 text-sm',
        sm: 'h-7 gap-1 px-3 text-xs rounded-md',
        lg: 'h-11 gap-2 px-6 text-base rounded-xl',
        icon: 'size-9',
        'icon-sm': 'size-7 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

// Press feedback is driven by framer-motion (whileTap scale 0.97) so it works
// uniformly across pointer + keyboard activation and respects reduced-motion.
// The native `active:scale` was removed to avoid double-scaling.
function Button({
  className,
  variant = 'primary',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const reduce = useReducedMotion();
  const motionProps = reduce
    ? {}
    : { whileTap: { scale: 0.97 }, transition: { duration: 0.08 } };
  return (
    <ButtonPrimitive
      data-slot="button"
      render={<motion.button {...motionProps} />}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
