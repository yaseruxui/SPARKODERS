import { cn } from '@/utils/cn';
import { SparkMark } from './spark-mark';
import { Wordmark } from './wordmark';

interface BrandLogoProps {
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * The Sparkoders lockup: the vector S mark, SPARKODERS lettering and the "CRAFTING DIGITAL
 * EXCELLENCE" slogan. On phones the header shows the name without the slogan, which would shrink
 * below a legible size there. The lettering is Latin and always reads left-to-right.
 */
export function BrandLogo({ size = 'md', className }: BrandLogoProps) {
  if (size === 'lg') {
    return (
      <span dir="ltr" className={cn('inline-flex items-center gap-3', className)}>
        <SparkMark id="footer-mark" className="w-[54px]" />
        <Wordmark withSlogan className="w-[210px] text-text" />
      </span>
    );
  }
  return (
    <span dir="ltr" className={cn('inline-flex items-center gap-2.5', className)}>
      <SparkMark id="header-mark" className="w-[34px] sm:w-[40px]" />
      <Wordmark className="w-[118px] text-text sm:hidden" />
      <Wordmark withSlogan className="w-[176px] text-text max-sm:hidden" />
    </span>
  );
}
