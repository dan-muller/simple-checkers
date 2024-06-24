import { cva, VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const loadingDotCva = cva(cn('loading-dot', 'bg-current rounded-full animate-bounce duration-1000'), {
  variants: {
    size: {
      sm: 'h-2 w-2',
      md: 'h-4 w-4',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

type LoadingDotsProps = VariantProps<typeof loadingDotCva>;
const LoadingDots = ({ size }: LoadingDotsProps) => {
  return (
    <span className="inline-flex text-center items-center leading-7 gap-0.5">
      <span className={cn(loadingDotCva({ size }), 'animation-delay-100')} />
      <span className={cn(loadingDotCva({ size }), 'animation-delay-200')} />
      <span className={cn(loadingDotCva({ size }), 'animation-delay-300')} />
    </span>
  );
};

export { LoadingDots, loadingDotCva };
export type { LoadingDotsProps };
