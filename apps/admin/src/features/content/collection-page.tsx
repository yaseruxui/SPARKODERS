import type { CollectionDataMap, CollectionItem, CollectionKey } from '@sparkoders/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, DownloadCloud, Pencil, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';
import { imageSrc } from '@/lib/media-url';
import type { LucideIcon } from 'lucide-react';

export interface CollectionConfig<K extends CollectionKey> {
  key: K;
  title: string;
  description: string;
  itemLabel: string;
  icon: LucideIcon;
  empty: () => CollectionDataMap[K];
  summary: (data: CollectionDataMap[K]) => { title: string; subtitle?: string; image?: string | null };
  Form: (props: { value: CollectionDataMap[K]; onChange: (v: CollectionDataMap[K]) => void }) => ReactNode;
}

/** Imports what the site shows today into the dashboard (only fills empty sections). */
export function ImportButton({ variant = 'outline' }: { variant?: 'outline' | 'default' }) {
  const client = useQueryClient();
  const run = useMutation({
    mutationFn: () => api<{ imported: string[] }>('/content/import', { method: 'POST' }),
    onSuccess: (r) => {
      toast.success(r.imported.length ? 'تم استيراد محتوى الموقع' : 'كل الأقسام فيها محتوى بالفعل');
      void client.invalidateQueries({ queryKey: ['content'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : ''),
  });
  return (
    <Button variant={variant} onClick={() => run.mutate()} disabled={run.isPending}>
      <DownloadCloud /> استيراد من الموقع
    </Button>
  );
}

/** List + editor for one ordered collection (services, team, testimonials). */
export function CollectionPage<K extends CollectionKey>({ config }: { config: CollectionConfig<K> }) {
  const client = useQueryClient();
  const queryKey = ['content', config.key];
  const items = useQuery({ queryKey, queryFn: () => api<CollectionItem<K>[]>(`/content/${config.key}`) });
  const [editing, setEditing] = useState<{ id: string | null; published: boolean; data: CollectionDataMap[K] } | null>(null);
  const [deleting, setDeleting] = useState<CollectionItem<K> | null>(null);
  const refresh = () => client.invalidateQueries({ queryKey });

  const save = useMutation({
    mutationFn: (draft: NonNullable<typeof editing>) =>
      draft.id
        ? api(`/content/${config.key}/${draft.id}`, { method: 'PATCH', body: { published: draft.published, data: draft.data } })
        : api(`/content/${config.key}`, { method: 'POST', body: { published: draft.published, data: draft.data } }),
    onSuccess: () => {
      toast.success('تم الحفظ ونُشر على الموقع');
      setEditing(null);
      void refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : ''),
  });
  const toggle = useMutation({
    mutationFn: (item: CollectionItem<K>) =>
      api(`/content/${config.key}/${item.id}`, { method: 'PATCH', body: { published: !item.published, data: item.data } }),
    onSuccess: () => void refresh(),
  });
  const reorder = useMutation({
    mutationFn: (ids: string[]) => api(`/content/${config.key}/reorder`, { method: 'POST', body: { ids } }),
    onSuccess: () => void refresh(),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/content/${config.key}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('تم الحذف');
      setDeleting(null);
      void refresh();
    },
  });

  const list = items.data ?? [];
  const move = (index: number, by: number) => {
    const ids = list.map((i) => i.id);
    const [moved] = ids.splice(index, 1);
    if (!moved) return;
    ids.splice(index + by, 0, moved);
    reorder.mutate(ids);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editing) save.mutate(editing);
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        title={config.title}
        description={config.description}
        actions={
          <Button onClick={() => setEditing({ id: null, published: true, data: config.empty() })}>
            <Plus /> إضافة {config.itemLabel}
          </Button>
        }
      />
      {items.isPending ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : list.length === 0 ? (
        <EmptyState
          icon={config.icon}
          title="لا يوجد محتوى بعد"
          description="الموقع يعرض حاليًا محتواه الأصلي. استورده هنا لتعدّل عليه، أو أضف من جديد."
          action={<ImportButton variant="default" />}
        />
      ) : (
        <ul className="bg-card divide-y rounded-xl border">
          {list.map((item, index) => {
            const s = config.summary(item.data);
            const src = imageSrc(s.image);
            return (
              <li key={item.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex flex-col">
                  <Button variant="ghost" size="icon" className="size-6" disabled={index === 0} onClick={() => move(index, -1)} aria-label="لأعلى">
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-6" disabled={index === list.length - 1} onClick={() => move(index, 1)} aria-label="لأسفل">
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>
                {s.image !== undefined && (
                  <div className="bg-muted size-14 shrink-0 overflow-hidden rounded-lg border">{src && <img src={src} alt="" className="size-full object-cover" />}</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.title || '—'}</p>
                  {s.subtitle && <p className="text-muted-foreground truncate text-sm">{s.subtitle}</p>}
                </div>
                {!item.published && <Badge variant="outline">مخفي</Badge>}
                <Switch checked={item.published} onCheckedChange={() => toggle.mutate(item)} aria-label="ظاهر على الموقع" />
                <Button variant="ghost" size="icon" onClick={() => setEditing({ id: item.id, published: item.published, data: item.data })} aria-label="تعديل">
                  <Pencil />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleting(item)} aria-label="حذف">
                  <Trash2 />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-2xl">
          <form onSubmit={submit} className="flex min-h-full flex-col">
            <SheetHeader>
              <SheetTitle>{editing?.id ? `تعديل ${config.itemLabel}` : `${config.itemLabel} جديد`}</SheetTitle>
              <SheetDescription>التغييرات تظهر على الموقع بعد الحفظ مباشرة.</SheetDescription>
            </SheetHeader>
            {editing && (
              <div className="grid flex-1 gap-6 px-4">
                <config.Form value={editing.data} onChange={(data) => setEditing({ ...editing, data })} />
                <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  ظاهر على الموقع
                  <Switch checked={editing.published} onCheckedChange={(published) => setEditing({ ...editing, published })} />
                </label>
              </div>
            )}
            <SheetFooter className="flex-row">
              <Button type="submit" disabled={save.isPending}>
                حفظ
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                إلغاء
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {deleting ? config.summary(deleting.data).title : ''}؟</AlertDialogTitle>
            <AlertDialogDescription>بيختفي من الموقع فورًا. ممكن تخفيه بدل الحذف.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white" onClick={() => deleting && remove.mutate(deleting.id)}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
