import type { TextOverrides } from '@sparkoders/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

/** Readable names for the message groups (first two key segments). */
const GROUPS: Record<string, string> = {
  'home.loader': 'شاشة التحميل',
  'home.hero': 'الرئيسية · الواجهة',
  'home.intro': 'الرئيسية · الجمل المتحركة',
  'home.work': 'الرئيسية · من أعمالنا',
  'home.leads': 'الرئيسية · زوار أكثر',
  'home.delight': 'من الفكرة إلى الإطلاق',
  'home.team': 'الفريق (العناوين)',
  'home.services': 'الخدمات (العناوين)',
  'home.testimonials': 'آراء العملاء (العناوين)',
  'home.blog': 'المدونة (الرئيسية)',
  'home.outro': 'الفوتر',
  'pages.work': 'صفحة الأعمال',
  'pages.blog': 'صفحة المدونة',
  'pages.services': 'صفحة الخدمات',
  'pages.about': 'صفحة من نحن',
  'pages.contact': 'صفحة تواصل معنا',
  'pages.privacy': 'سياسة الخصوصية',
  navigation: 'القائمة',
  common: 'عام',
  contact: 'نموذج التواصل',
  metadata: 'محركات البحث',
  projects: 'تفاصيل المشاريع',
  articles: 'المقالات',
};

const groupOf = (key: string) => {
  const two = key.split('.').slice(0, 2).join('.');
  return GROUPS[two] ? two : key.split('.')[0] ?? key;
};

function TextRow({ k, defaults, overrides }: { k: string; defaults: TextOverrides; overrides: TextOverrides }) {
  const client = useQueryClient();
  const [ar, setAr] = useState(overrides.ar[k] ?? defaults.ar[k] ?? '');
  const [en, setEn] = useState(overrides.en[k] ?? defaults.en[k] ?? '');
  const edited = k in overrides.ar || k in overrides.en;
  const save = useMutation({
    mutationFn: async (next: { locale: 'ar' | 'en'; value: string | null }) => api<TextOverrides>('/content/texts', { method: 'PUT', body: { key: k, ...next } }),
    onSuccess: (data) => client.setQueryData(['content', 'texts'], data),
    onError: (e) => toast.error(e instanceof Error ? e.message : ''),
  });
  const commit = (locale: 'ar' | 'en', value: string) => {
    const current = overrides[locale][k] ?? defaults[locale][k] ?? '';
    if (value === current) return;
    // Back to the bundled text = no override.
    save.mutate({ locale, value: value === defaults[locale][k] ? null : value }, { onSuccess: () => toast.success('تم الحفظ') });
  };
  const long = (defaults.ar[k] ?? '').length > 70;
  const Control = long ? Textarea : Input;
  return (
    <div className={cn('grid gap-2 border-b px-4 py-3 last:border-0', edited && 'bg-brand/[0.04]')}>
      <div className="flex items-center gap-2">
        <code dir="ltr" className="text-muted-foreground truncate text-xs">{k}</code>
        {edited && <Badge variant="outline" className="h-5 text-[10px]">معدّل</Badge>}
        {edited && (
          <Button
            variant="ghost"
            size="sm"
            className="ms-auto h-7 text-xs"
            onClick={async () => {
              await save.mutateAsync({ locale: 'ar', value: null });
              await save.mutateAsync({ locale: 'en', value: null });
              setAr(defaults.ar[k] ?? '');
              setEn(defaults.en[k] ?? '');
              toast.success('رجع للنص الأصلي');
            }}
          >
            <RotateCcw className="size-3.5" /> النص الأصلي
          </Button>
        )}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Control value={ar} onChange={(e) => setAr(e.target.value)} onBlur={() => commit('ar', ar)} rows={long ? 3 : undefined} />
        <Control dir="ltr" value={en} onChange={(e) => setEn(e.target.value)} onBlur={() => commit('en', en)} rows={long ? 3 : undefined} />
      </div>
    </div>
  );
}

/** Every text on the site, grouped by page; saving a field publishes it. */
export function TextsPage() {
  const defaults = useQuery({ queryKey: ['content', 'texts', 'defaults'], queryFn: () => api<TextOverrides>('/content/texts/defaults'), staleTime: Infinity, retry: false });
  const overrides = useQuery({ queryKey: ['content', 'texts'], queryFn: () => api<TextOverrides>('/content/texts') });
  const [q, setQ] = useState('');
  const [group, setGroup] = useState<string | null>(null);

  const keys = useMemo(() => Object.keys(defaults.data?.ar ?? {}), [defaults.data]);
  const groups = useMemo(() => [...new Set(keys.map(groupOf))], [keys]);
  const active = group ?? groups[0] ?? null;
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle) return keys.filter((k) => k.toLowerCase().includes(needle) || (defaults.data?.ar[k] ?? '').includes(q.trim()) || (defaults.data?.en[k] ?? '').toLowerCase().includes(needle)).slice(0, 60);
    return keys.filter((k) => groupOf(k) === active);
  }, [keys, q, active, defaults.data]);

  return (
    <div className="grid gap-6">
      <PageHeader title="نصوص الصفحات" description="كل نصوص الموقع بالعربي والإنجليزي. عدّل الحقل واخرج منه ليُحفظ ويُنشر." />
      {defaults.isError ? (
        <EmptyState icon={FileText} title="تعذّر الوصول للموقع" description="لقراءة النصوص الأصلية، لازم يكون الموقع شغّال وإعداد SITE_URL و SITE_REVALIDATE_SECRET صحيح في الـ API." />
      ) : !defaults.data || !overrides.data ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="grid content-start gap-1">
            <div className="relative mb-2">
              <Search className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في النصوص" className="ps-9" />
            </div>
            {groups.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGroup(g);
                  setQ('');
                }}
                className={cn('rounded-md px-3 py-1.5 text-start text-sm', !q && active === g ? 'bg-muted font-semibold' : 'text-muted-foreground hover:text-foreground')}
              >
                {GROUPS[g] ?? g}
              </button>
            ))}
          </aside>
          <div className="bg-card min-w-0 overflow-hidden rounded-xl border">
            {shown.length === 0 ? (
              <p className="text-muted-foreground p-8 text-center text-sm">لا توجد نتائج.</p>
            ) : (
              shown.map((k) => <TextRow key={k} k={k} defaults={defaults.data} overrides={overrides.data} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
