import { cn } from '@/utils/cn';
import { Kashida } from '@/components/ui/kashida';

interface SectionHeadingProps {
  title: string;
  accent: string;
  body: string;
  align?: 'start' | 'center';
  className?: string;
}

/** Two-line display title (second line in the brand violet) + lead paragraph. The heading speaks for itself. */
export function SectionHeading({ title, accent, body, align = 'start', className }: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', className)}>
      <h3 className="display-xl mb-6">
        <Kashida text={title} />
        <br />
        <span className="text-violet">
          <Kashida text={accent} />
        </span>
      </h3>
      <p className={cn('max-w-[34rem] text-lg text-muted', align === 'center' && 'mx-auto')}>{body}</p>
    </div>
  );
}
