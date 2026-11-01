import {
  type InboxMessage,
  MESSAGE_STATUSES,
  type MessageStatus,
  type Paginated,
  type StatusCounts,
} from '@sparkoders/contracts';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Inbox, Mail, Phone, Search, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, timeAgo } from '@/components/page-header';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { API_URL, api } from '@/lib/api';
import { interestLabels, statusLabels, statusTone } from '@/lib/labels';
import { cn } from '@/lib/utils';

const PER_PAGE = 20;

function StatusBadge({ status }: { status: MessageStatus }) {
  return <Badge className={cn('whitespace-nowrap', statusTone[status])}>{statusLabels[status]}</Badge>;
}

function StatusSelect({ value, onChange, className }: { value: MessageStatus; onChange: (s: MessageStatus) => void; className?: string }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as MessageStatus)}>
      <SelectTrigger className={cn('w-40', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MESSAGE_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {statusLabels[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** One enquiry in full: details, status, internal notes. */
function MessageSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const client = useQueryClient();
  const message = useQuery({ queryKey: ['inbox', 'message', id], queryFn: () => api<InboxMessage>(`/inbox/${id}`), enabled: !!id });
  const [note, setNote] = useState('');
  const refresh = () => client.invalidateQueries({ queryKey: ['inbox'] });

  const setStatus = useMutation({
    mutationFn: (status: MessageStatus) => api<InboxMessage>(`/inbox/${id}/status`, { method: 'PATCH', body: { status } }),
    onSuccess: () => {
      toast.success('تم تحديث الحالة');
      void refresh();
    },
  });
  const addNote = useMutation({
    mutationFn: (body: string) => api<InboxMessage>(`/inbox/${id}/notes`, { method: 'POST', body: { body } }),
    onSuccess: () => {
      setNote('');
      void refresh();
    },
  });
  const removeNote = useMutation({
    mutationFn: (noteId: string) => api(`/inbox/notes/${noteId}`, { method: 'DELETE' }),
    onSuccess: () => void refresh(),
  });

  const m = message.data;
  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-lg">
        {!m ? (
          <div className="grid gap-3 p-6">
            <SheetTitle className="sr-only">جارٍ التحميل</SheetTitle>
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl">{m.name}</SheetTitle>
              <SheetDescription>
                {m.organisation} · {new Date(m.createdAt).toLocaleString('ar', { dateStyle: 'medium', timeStyle: 'short' })}
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-6 px-4 pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <StatusSelect value={m.status} onChange={(s) => setStatus.mutate(s)} />
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${m.email}`}>
                    <Mail /> رد بالبريد
                  </a>
                </Button>
                {m.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://wa.me/${m.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener">
                      <Phone /> واتساب
                    </a>
                  </Button>
                )}
              </div>
              <dl className="grid gap-3 text-sm">
                <div className="flex gap-3">
                  <dt className="text-muted-foreground w-24 shrink-0">البريد</dt>
                  <dd dir="ltr" className="text-end rtl:text-start">{m.email}</dd>
                </div>
                {m.phone && (
                  <div className="flex gap-3">
                    <dt className="text-muted-foreground w-24 shrink-0">الجوال</dt>
                    <dd dir="ltr" className="text-end rtl:text-start">{m.phone}</dd>
                  </div>
                )}
                <div className="flex gap-3">
                  <dt className="text-muted-foreground w-24 shrink-0">الخدمات</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {m.interests.length ? m.interests.map((i) => <Badge key={i} variant="secondary">{interestLabels[i]}</Badge>) : '—'}
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="text-muted-foreground w-24 shrink-0">لغة الموقع</dt>
                  <dd>{m.locale === 'en' ? 'الإنجليزية' : 'العربية'}</dd>
                </div>
              </dl>
              <div>
                <p className="text-muted-foreground mb-2 text-sm">الرسالة</p>
                <p className="bg-muted/40 rounded-lg border p-4 leading-relaxed whitespace-pre-wrap">{m.message || '—'}</p>
              </div>
              <div className="grid gap-3">
                <p className="text-sm font-semibold">ملاحظات داخلية</p>
                {m.notes.map((n) => (
                  <div key={n.id} className="group bg-card rounded-lg border p-3 text-sm">
                    <p className="whitespace-pre-wrap">{n.body}</p>
                    <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
                      <span>
                        {n.author?.name ?? 'مستخدم محذوف'} · {timeAgo(n.createdAt)}
                      </span>
                      <button type="button" className="hover:text-destructive opacity-0 group-hover:opacity-100" onClick={() => removeNote.mutate(n.id)}>
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
                <form
                  className="grid gap-2"
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    if (note.trim()) addNote.mutate(note.trim());
                  }}
                >
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="اكتب ملاحظة لفريقك…" rows={3} />
                  <Button type="submit" size="sm" variant="secondary" disabled={!note.trim() || addNote.isPending} className="justify-self-start">
                    إضافة ملاحظة
                  </Button>
                </form>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function InboxPage() {
  const client = useQueryClient();
  const [params, setParams] = useSearchParams();
  const status = (MESSAGE_STATUSES as readonly string[]).includes(params.get('status') ?? '') ? (params.get('status') as MessageStatus) : undefined;
  const page = Math.max(1, Number(params.get('page') ?? 1));
  const q = params.get('q') ?? '';
  const open = params.get('open');
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) (v ? p.set(k, v) : p.delete(k));
    setParams(p);
  };

  const counts = useQuery({ queryKey: ['inbox', 'counts'], queryFn: () => api<StatusCounts>('/inbox/counts') });
  const list = useQuery({
    queryKey: ['inbox', 'list', status, page, q],
    queryFn: () =>
      api<Paginated<InboxMessage>>(
        `/inbox?${new URLSearchParams({ page: String(page), perPage: String(PER_PAGE), ...(status ? { status } : {}), ...(q ? { q } : {}) })}`,
      ),
    placeholderData: keepPreviousData,
  });
  const refresh = () => client.invalidateQueries({ queryKey: ['inbox'] });

  const bulkStatus = useMutation({
    mutationFn: (s: MessageStatus) => api('/inbox/status', { method: 'PATCH', body: { ids: selected, status: s } }),
    onSuccess: () => {
      toast.success('تم تحديث الحالة');
      setSelected([]);
      void refresh();
    },
  });
  const bulkDelete = useMutation({
    mutationFn: () => api('/inbox/bulk-delete', { method: 'POST', body: { ids: selected } }),
    onSuccess: () => {
      toast.success('تم الحذف');
      setSelected([]);
      setConfirmDelete(false);
      void refresh();
    },
  });

  const items = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const allCount = counts.data ? MESSAGE_STATUSES.reduce((s, k) => s + counts.data[k], 0) : undefined;
  const allSelected = items.length > 0 && items.every((m) => selected.includes(m.id));

  return (
    <div className="grid gap-6">
      <PageHeader
        title="طلبات التواصل"
        description="كل ما يصل من نموذج التواصل في الموقع."
        actions={
          <Button variant="outline" asChild>
            <a href={`${API_URL}/inbox/export${status ? `?status=${status}` : ''}`}>
              <Download /> تصدير CSV
            </a>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-muted/60 flex flex-wrap gap-1 rounded-lg p-1">
          {[undefined, ...MESSAGE_STATUSES].map((s) => (
            <button
              key={s ?? 'all'}
              type="button"
              onClick={() => update({ status: s ?? null, page: null })}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm transition-colors',
                status === s ? 'bg-background text-foreground font-semibold shadow-xs' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {s ? statusLabels[s] : 'الكل'}
              <span className="text-muted-foreground ms-1.5 text-xs tabular-nums">{s ? (counts.data?.[s] ?? '') : (allCount ?? '')}</span>
            </button>
          ))}
        </div>
        <form
          className="relative ms-auto w-full sm:w-64"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: String(new FormData(e.currentTarget).get('q') ?? '').trim() || null, page: null });
          }}
        >
          <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input name="q" defaultValue={q} placeholder="بحث بالاسم أو البريد أو النص" className="ps-9" />
        </form>
      </div>

      {selected.length > 0 && (
        <div className="bg-card flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2.5">
          <span className="text-sm font-medium">تم تحديد {selected.length}</span>
          <Select onValueChange={(v) => bulkStatus.mutate(v as MessageStatus)}>
            <SelectTrigger className="h-8 w-44">
              <SelectValue placeholder="تغيير الحالة إلى…" />
            </SelectTrigger>
            <SelectContent>
              {MESSAGE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabels[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 /> حذف
          </Button>
          <Button variant="ghost" size="sm" className="ms-auto" onClick={() => setSelected([])}>
            إلغاء التحديد
          </Button>
        </div>
      )}

      {list.isPending ? (
        <div className="grid gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={q || status ? 'لا توجد نتائج' : 'لا توجد طلبات بعد'}
          description={q || status ? 'جرّب بحثًا أو حالة أخرى.' : 'لما يعبّي أحد نموذج التواصل في الموقع، يظهر طلبه هنا.'}
        />
      ) : (
        <div className="bg-card overflow-hidden rounded-xl border">
          <div className="text-muted-foreground flex items-center gap-4 border-b px-4 py-2 text-xs">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(v) => setSelected(v ? items.map((m) => m.id) : [])}
              aria-label="تحديد الكل"
            />
            <span>المرسل</span>
          </div>
          <ul className="divide-y">
            {items.map((m) => (
              <li key={m.id} className={cn('flex items-center gap-4 px-4 py-3', m.status === 'new' && 'bg-brand/[0.04]')}>
                <Checkbox
                  checked={selected.includes(m.id)}
                  onCheckedChange={(v) => setSelected((cur) => (v ? [...cur, m.id] : cur.filter((x) => x !== m.id)))}
                  aria-label={`تحديد ${m.name}`}
                />
                <button type="button" onClick={() => update({ open: m.id })} className="flex min-w-0 flex-1 items-center gap-4 text-start">
                  <div className="min-w-0 flex-1">
                    <p className={cn('truncate', m.status === 'new' && 'font-semibold')}>
                      {m.name} <span className="text-muted-foreground font-normal">· {m.organisation}</span>
                    </p>
                    <p className="text-muted-foreground truncate text-sm">{m.message || m.email}</p>
                  </div>
                  <div className="hidden flex-wrap gap-1 lg:flex">
                    {m.interests.slice(0, 2).map((i) => (
                      <Badge key={i} variant="secondary" className="whitespace-nowrap">
                        {interestLabels[i]}
                      </Badge>
                    ))}
                  </div>
                  <StatusBadge status={m.status} />
                  <span className="text-muted-foreground hidden w-24 text-end text-xs sm:block">{timeAgo(m.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
            السابق
          </Button>
          <span className="text-muted-foreground text-sm tabular-nums">
            {page} / {pages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })}>
            التالي
          </Button>
        </div>
      )}

      <MessageSheet id={open} onClose={() => update({ open: null })} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {selected.length} طلب؟</AlertDialogTitle>
            <AlertDialogDescription>لا يمكن التراجع عن الحذف.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white" onClick={() => bulkDelete.mutate()}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
