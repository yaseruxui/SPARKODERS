import type { MediaItem } from '@sparkoders/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, LoaderCircle, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { API_URL, api, ApiError } from '@/lib/api';
import { imageSrc } from '@/lib/media-url';
import { cn } from '@/lib/utils';

/** Uploads one file to the media library (multipart; the API checks the type from its bytes). */
export async function uploadMedia(file: File): Promise<MediaItem> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${API_URL}/media`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'x-sparkoders-admin': '1' },
    body,
  });
  const data = (await response.json().catch(() => null)) as { message?: string } | MediaItem | null;
  if (!response.ok) throw new ApiError(response.status, (data as { message?: string } | null)?.message ?? 'تعذّر رفع الملف.');
  return data as MediaItem;
}

export function useMediaList(enabled = true) {
  return useQuery({ queryKey: ['media'], queryFn: () => api<MediaItem[]>('/media'), enabled });
}

export function useUpload() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const results: MediaItem[] = [];
      for (const file of files) results.push(await uploadMedia(file));
      return results;
    },
    onSuccess: (items) => {
      toast.success(items.length > 1 ? `تم رفع ${items.length} ملفات` : 'تم رفع الملف');
      void client.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'تعذّر رفع الملف.'),
  });
}

/** Chooses an image from the library (or uploads a new one) for a content field. */
function MediaPickerDialog({ open, onOpenChange, onPick }: { open: boolean; onOpenChange: (o: boolean) => void; onPick: (url: string) => void }) {
  const media = useMediaList(open);
  const upload = useUpload();
  const input = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>مكتبة الوسائط</DialogTitle>
          <DialogDescription>اختر صورة أو ارفع صورة جديدة (PNG, JPG, WebP, AVIF حتى 8MB).</DialogDescription>
        </DialogHeader>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          hidden
          onChange={(e) => {
            const files = [...(e.target.files ?? [])];
            e.target.value = '';
            if (files.length)
              upload.mutate(files, { onSuccess: (items) => items[0] && (onPick(items[0].url), onOpenChange(false)) });
          }}
        />
        <Button variant="outline" onClick={() => input.current?.click()} disabled={upload.isPending} className="justify-self-start">
          {upload.isPending ? <LoaderCircle className="animate-spin" /> : <Upload />} رفع صورة
        </Button>
        <div className="grid max-h-[55vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
          {media.isPending
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-lg" />)
            : media.data?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onPick(item.url);
                    onOpenChange(false);
                  }}
                  className="group bg-muted relative aspect-square overflow-hidden rounded-lg border focus-visible:ring-2"
                  title={item.filename}
                >
                  <img src={item.url} alt={item.alt} className="size-full object-cover transition-transform group-hover:scale-105" />
                </button>
              ))}
          {media.data?.length === 0 && <p className="text-muted-foreground col-span-full py-8 text-center text-sm">المكتبة فاضية. ارفع أول صورة.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** An image field: preview + choose/replace + remove. */
export function ImageField({ value, onChange, className }: { value: string | null; onChange: (v: string | null) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const src = imageSrc(value);
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
        {src ? <img src={src} alt="" className="size-full object-cover" /> : <ImagePlus className="text-muted-foreground size-6" />}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {value ? 'تغيير الصورة' : 'اختيار صورة'}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <X /> إزالة
          </Button>
        )}
      </div>
      <MediaPickerDialog open={open} onOpenChange={setOpen} onPick={onChange} />
    </div>
  );
}
