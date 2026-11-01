import type { MediaItem } from '@sparkoders/contracts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, Images, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaList, useUpload } from '@/features/media/media-picker';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

function MediaCard({ item }: { item: MediaItem }) {
  const client = useQueryClient();
  const [alt, setAlt] = useState(item.alt);
  const update = useMutation({
    mutationFn: (value: string) => api(`/media/${item.id}`, { method: 'PATCH', body: { alt: value } }),
    onSuccess: () => toast.success('تم حفظ الوصف'),
  });
  const remove = useMutation({
    mutationFn: () => api(`/media/${item.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('تم الحذف');
      void client.invalidateQueries({ queryKey: ['media'] });
    },
  });
  return (
    <div className="bg-card group grid overflow-hidden rounded-xl border">
      <div className="bg-muted relative aspect-[4/3]">
        <img src={item.url} alt={item.alt} className="size-full object-cover" loading="lazy" />
        <div className="absolute inset-x-2 top-2 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Button size="icon" variant="secondary" className="size-8" aria-label="نسخ الرابط" onClick={() => void navigator.clipboard.writeText(item.url).then(() => toast.success('تم نسخ الرابط'))}>
            <Copy />
          </Button>
          <Button size="icon" variant="secondary" className="text-destructive size-8" aria-label="حذف" onClick={() => remove.mutate()}>
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="grid gap-1.5 p-3">
        <p className="truncate text-xs" title={item.filename}>
          {item.filename} <span className="text-muted-foreground">· {Math.round(item.size / 1024)}KB</span>
        </p>
        <Input value={alt} onChange={(e) => setAlt(e.target.value)} onBlur={() => alt !== item.alt && update.mutate(alt)} placeholder="وصف الصورة (لقارئ الشاشة)" className="h-8 text-xs" />
      </div>
    </div>
  );
}

export function MediaPage() {
  const media = useMediaList();
  const upload = useUpload();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className="grid gap-6"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'));
        if (files.length) upload.mutate(files);
      }}
    >
      <PageHeader
        title="مكتبة الوسائط"
        description="الصور المستخدمة في الموقع. اسحبها هنا أو ارفعها (PNG, JPG, WebP, AVIF حتى 8MB)."
        actions={
          <Button onClick={() => input.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? <LoaderCircle className="animate-spin" /> : <Upload />} رفع صور
          </Button>
        }
      />
      <input
        ref={input}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = '';
          if (files.length) upload.mutate(files);
        }}
      />
      <div className={cn('rounded-xl transition-colors', dragging && 'ring-brand bg-brand/5 ring-2')}>
        {media.isPending ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        ) : media.data?.length === 0 ? (
          <EmptyState icon={Images} title="المكتبة فاضية" description="ارفع صورًا لتستخدمها في الخدمات والفريق والآراء." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {media.data?.map((item) => <MediaCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
