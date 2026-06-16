import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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

function Button({
  className,
  variant = 'primary',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
