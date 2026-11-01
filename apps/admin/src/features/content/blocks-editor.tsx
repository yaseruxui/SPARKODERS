import type { ArticleBlock } from '@sparkoders/contracts';
import { ArrowDown, ArrowUp, Heading2, List, Pilcrow, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const labels = { h2: 'عنوان', p: 'فقرة', ul: 'قائمة نقاط' } as const;

/** The body of an article in one language: headings, paragraphs and bullet lists in order. */
export function BlocksEditor({ value, onChange, dir }: { value: ArticleBlock[]; onChange: (v: ArticleBlock[]) => void; dir: 'rtl' | 'ltr' }) {
  const set = (index: number, block: ArticleBlock) => onChange(value.map((b, i) => (i === index ? block : b)));
  const move = (index: number, by: number) => {
    const next = [...value];
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(index + by, 0, moved);
    onChange(next);
  };
  const add = (type: ArticleBlock['type']) =>
    onChange([...value, type === 'ul' ? { type, items: [] } : { type, text: '' }]);

  return (
    <div className="grid gap-3">
      {value.length === 0 && <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">المقال فاضي. ابدأ بفقرة أو عنوان.</p>}
      {value.map((block, index) => (
        <div key={index} className="bg-muted/30 grid gap-2 rounded-lg border p-3">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <span className="font-medium">{labels[block.type]}</span>
            <Button type="button" variant="ghost" size="icon" className="ms-auto size-6" disabled={index === 0} onClick={() => move(index, -1)} aria-label="لأعلى">
              <ArrowUp className="size-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-6" disabled={index === value.length - 1} onClick={() => move(index, 1)} aria-label="لأسفل">
              <ArrowDown className="size-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-destructive size-6" onClick={() => onChange(value.filter((_, i) => i !== index))} aria-label="حذف">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          {block.type === 'h2' && <Input dir={dir} className="font-semibold" value={block.text} onChange={(e) => set(index, { type: 'h2', text: e.target.value })} />}
          {block.type === 'p' && <Textarea dir={dir} rows={4} value={block.text} onChange={(e) => set(index, { type: 'p', text: e.target.value })} />}
          {block.type === 'ul' && (
            <Textarea
              dir={dir}
              rows={4}
              placeholder="سطر لكل نقطة"
              defaultValue={block.items.join('\n')}
              onChange={(e) => set(index, { type: 'ul', items: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean) })}
            />
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => add('h2')}>
          <Heading2 /> عنوان
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add('p')}>
          <Pilcrow /> فقرة
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => add('ul')}>
          <List /> قائمة
        </Button>
      </div>
    </div>
  );
}
