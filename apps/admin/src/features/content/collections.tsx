import { SERVICE_ICONS, type ServiceIcon } from '@sparkoders/contracts';
import { BookOpen, FolderKanban, MessageSquareQuote, Plus, Sparkles, Trash2, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlocksEditor } from './blocks-editor';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageField } from '@/features/media/media-picker';
import type { CollectionConfig } from './collection-page';
import { LocalizedField, LocalizedListField } from './fields';

const L = () => ({ ar: '', en: '' });

const iconLabels: Record<ServiceIcon, string> = {
  website: 'موقع (شاشة وكود)',
  store: 'متجر (سلة)',
  app: 'تطبيق (جوال)',
  systems: 'أنظمة (لوحة)',
  branding: 'هوية (ألوان)',
  seo: 'بحث (عدسة)',
};

export const servicesConfig: CollectionConfig<'services'> = {
  key: 'services',
  title: 'الخدمات',
  description: 'الخدمات في الصفحة الرئيسية وصفحة «خدماتنا»، بالترتيب اللي يظهر على الموقع.',
  itemLabel: 'خدمة',
  icon: Sparkles,
  empty: () => ({ icon: 'website', image: null, title: L(), body: L(), intro: L(), forWho: L(), alt: L(), deliverables: { ar: [], en: [] } }),
  summary: (d) => ({ title: d.title.ar, subtitle: d.body.ar, image: d.image }),
  Form: ({ value, onChange }) => (
    <>
      <LocalizedField label="اسم الخدمة" value={value.title} onChange={(title) => onChange({ ...value, title })} required />
      <div className="grid gap-2">
        <Label>الأيقونة</Label>
        <Select value={value.icon} onValueChange={(icon) => onChange({ ...value, icon: icon as ServiceIcon })}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_ICONS.map((i) => (
              <SelectItem key={i} value={i}>
                {iconLabels[i]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>الصورة (تظهر عند المرور وفي صفحة الخدمات)</Label>
        <ImageField value={value.image} onChange={(image) => onChange({ ...value, image })} />
      </div>
      <LocalizedField label="وصف الصورة" value={value.alt} onChange={(alt) => onChange({ ...value, alt })} />
      <LocalizedField label="سطر في الصفحة الرئيسية" value={value.body} onChange={(body) => onChange({ ...value, body })} multiline />
      <LocalizedField label="الشرح في صفحة الخدمات" value={value.intro} onChange={(intro) => onChange({ ...value, intro })} multiline />
      <LocalizedField label="مناسبة لـ" value={value.forWho} onChange={(forWho) => onChange({ ...value, forWho })} multiline />
      <LocalizedListField label="شو تستلم" value={value.deliverables} onChange={(deliverables) => onChange({ ...value, deliverables })} />
    </>
  ),
};

export const teamConfig: CollectionConfig<'team'> = {
  key: 'team',
  title: 'الفريق',
  description: 'أعضاء الفريق في الصفحة الرئيسية وصفحة «من نحن».',
  itemLabel: 'عضو',
  icon: UsersRound,
  empty: () => ({ name: L(), role: L(), bio: L(), image: null }),
  summary: (d) => ({ title: d.name.ar, subtitle: d.role.ar, image: d.image }),
  Form: ({ value, onChange }) => (
    <>
      <div className="grid gap-2">
        <Label>الصورة (مربعة، 560px على الأقل)</Label>
        <ImageField value={value.image} onChange={(image) => onChange({ ...value, image })} />
      </div>
      <LocalizedField label="الاسم" value={value.name} onChange={(name) => onChange({ ...value, name })} required />
      <LocalizedField label="المسمى الوظيفي" value={value.role} onChange={(role) => onChange({ ...value, role })} required />
      <LocalizedField label="نبذة" value={value.bio} onChange={(bio) => onChange({ ...value, bio })} multiline />
    </>
  ),
};

export const testimonialsConfig: CollectionConfig<'testimonials'> = {
  key: 'testimonials',
  title: 'آراء العملاء',
  description: 'الآراء في الصفحة الرئيسية وصفحة «من نحن». كل رأي بصورته يظهر في الدائرة حول البطاقة.',
  itemLabel: 'رأي',
  icon: MessageSquareQuote,
  empty: () => ({ quote: L(), name: L(), role: L(), image: null }),
  summary: (d) => ({ title: d.name.ar, subtitle: d.quote.ar, image: d.image }),
  Form: ({ value, onChange }) => (
    <>
      <LocalizedField label="الرأي" value={value.quote} onChange={(quote) => onChange({ ...value, quote })} multiline required />
      <LocalizedField label="اسم العميل" value={value.name} onChange={(name) => onChange({ ...value, name })} required />
      <LocalizedField label="المنصب والشركة" value={value.role} onChange={(role) => onChange({ ...value, role })} />
      <div className="grid gap-2">
        <Label>صورة العميل (بموافقته)</Label>
        <ImageField value={value.image} onChange={(image) => onChange({ ...value, image })} />
      </div>
    </>
  ),
};

function SlugField({ value, onChange, base }: { value: string; onChange: (v: string) => void; base: string }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="slug">الرابط (slug)</Label>
      <Input id="slug" dir="ltr" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="my-project" value={value} onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
      <p className="text-muted-foreground text-xs" dir="ltr">
        {base}/{value || '…'}
      </p>
    </div>
  );
}

function AccentField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const swatches = ['#b26cff,#0c8ec7', '#0c8ec7,#7feefa', '#6e29ac,#b26cff', '#b26cff,#7feefa', '#17123a,#0c8ec7', '#7feefa,#a497fa'];
  return (
    <div className="grid gap-2">
      <Label>لون البطاقة لو ما في صورة</Label>
      <div className="flex gap-2">
        {swatches.map((colors, i) => (
          <button
            key={colors}
            type="button"
            aria-label={`لون ${i + 1}`}
            onClick={() => onChange(i + 1)}
            className={`size-8 rounded-md ring-offset-2 ring-offset-background ${value === i + 1 ? 'ring-brand ring-2' : ''}`}
            style={{ background: `linear-gradient(135deg, ${colors})` }}
          />
        ))}
      </div>
    </div>
  );
}

export const projectsConfig: CollectionConfig<'projects'> = {
  key: 'projects',
  title: 'المشاريع',
  description: 'أعمالكم في الصفحة الرئيسية (أول ستة) وصفحة «أعمالنا»، وكل مشروع إله صفحة تفاصيل.',
  itemLabel: 'مشروع',
  icon: FolderKanban,
  empty: () => ({
    slug: '',
    accent: 1,
    image: null,
    title: L(),
    category: L(),
    alt: L(),
    summary: L(),
    client: L(),
    year: String(new Date().getFullYear()),
    duration: L(),
    services: { ar: [], en: [] },
    challenge: L(),
    solution: L(),
    features: { ar: [], en: [] },
    results: [],
  }),
  summary: (d) => ({ title: d.title.ar, subtitle: `${d.category.ar} · ${d.client.ar} · ${d.year}`, image: d.image }),
  Form: ({ value, onChange }) => (
    <>
      <LocalizedField label="اسم المشروع" value={value.title} onChange={(title) => onChange({ ...value, title })} required />
      <SlugField value={value.slug} onChange={(slug) => onChange({ ...value, slug })} base="/ar/work" />
      <div className="grid gap-2">
        <Label>صورة المشروع (4:3، 1600×1200 مثالي)</Label>
        <ImageField value={value.image} onChange={(image) => onChange({ ...value, image })} />
      </div>
      <LocalizedField label="وصف الصورة" value={value.alt} onChange={(alt) => onChange({ ...value, alt })} />
      <AccentField value={value.accent} onChange={(accent) => onChange({ ...value, accent })} />
      <LocalizedField label="القطاع" value={value.category} onChange={(category) => onChange({ ...value, category })} required />
      <LocalizedField label="العميل" value={value.client} onChange={(client) => onChange({ ...value, client })} />
      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <div className="grid gap-2">
          <Label htmlFor="year">السنة</Label>
          <Input id="year" dir="ltr" value={value.year} onChange={(e) => onChange({ ...value, year: e.target.value })} />
        </div>
        <LocalizedField label="المدة" value={value.duration} onChange={(duration) => onChange({ ...value, duration })} />
      </div>
      <LocalizedField label="ملخص (تحت العنوان)" value={value.summary} onChange={(summary) => onChange({ ...value, summary })} multiline />
      <LocalizedListField label="الخدمات المقدّمة" value={value.services} onChange={(services) => onChange({ ...value, services })} />
      <LocalizedField label="التحدي" value={value.challenge} onChange={(challenge) => onChange({ ...value, challenge })} multiline />
      <LocalizedField label="الحل" value={value.solution} onChange={(solution) => onChange({ ...value, solution })} multiline />
      <LocalizedListField label="أبرز المزايا" value={value.features} onChange={(features) => onChange({ ...value, features })} />
      <fieldset className="grid gap-3">
        <legend className="mb-2 text-sm font-medium">النتائج (حتى 6)</legend>
        {value.results.map((r, i) => (
          <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[110px_1fr_1fr_auto] sm:items-end">
            <Input dir="ltr" placeholder="+40%" value={r.value} onChange={(e) => onChange({ ...value, results: value.results.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
            <Input placeholder="الوصف بالعربي" value={r.label.ar} onChange={(e) => onChange({ ...value, results: value.results.map((x, j) => (j === i ? { ...x, label: { ...x.label, ar: e.target.value } } : x)) })} />
            <Input dir="ltr" placeholder="English label" value={r.label.en} onChange={(e) => onChange({ ...value, results: value.results.map((x, j) => (j === i ? { ...x, label: { ...x.label, en: e.target.value } } : x)) })} />
            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => onChange({ ...value, results: value.results.filter((_, j) => j !== i) })} aria-label="حذف">
              <Trash2 />
            </Button>
          </div>
        ))}
        {value.results.length < 6 && (
          <Button type="button" variant="outline" size="sm" className="justify-self-start" onClick={() => onChange({ ...value, results: [...value.results, { value: '', label: L() }] })}>
            <Plus /> نتيجة
          </Button>
        )}
      </fieldset>
    </>
  ),
};

export const postsConfig: CollectionConfig<'posts'> = {
  key: 'posts',
  title: 'المدونة',
  description: 'المقالات في صفحة المدونة (الأحدث أولًا)، وأحدث ثلاثة في الصفحة الرئيسية.',
  itemLabel: 'مقال',
  icon: BookOpen,
  empty: () => ({
    slug: '',
    accent: 1,
    image: null,
    date: new Date().toISOString().slice(0, 10),
    title: L(),
    alt: L(),
    category: { ar: 'نصائح', en: 'Tips' },
    excerpt: L(),
    readTime: { ar: '5 دقائق', en: '5 min' },
    body: { ar: [], en: [] },
  }),
  summary: (d) => ({ title: d.title.ar, subtitle: `${d.date} · ${d.category.ar}`, image: d.image }),
  Form: ({ value, onChange }) => (
    <>
      <LocalizedField label="عنوان المقال" value={value.title} onChange={(title) => onChange({ ...value, title })} required />
      <SlugField value={value.slug} onChange={(slug) => onChange({ ...value, slug })} base="/ar/blog" />
      <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
        <div className="grid gap-2">
          <Label htmlFor="date">تاريخ النشر</Label>
          <Input id="date" type="date" dir="ltr" required value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} />
        </div>
        <LocalizedField label="التصنيف" value={value.category} onChange={(category) => onChange({ ...value, category })} />
      </div>
      <div className="grid gap-2">
        <Label>صورة الغلاف (16:9)</Label>
        <ImageField value={value.image} onChange={(image) => onChange({ ...value, image })} />
      </div>
      <LocalizedField label="وصف الصورة" value={value.alt} onChange={(alt) => onChange({ ...value, alt })} />
      <AccentField value={value.accent} onChange={(accent) => onChange({ ...value, accent })} />
      <LocalizedField label="المقتطف (يظهر في البطاقة ومحركات البحث)" value={value.excerpt} onChange={(excerpt) => onChange({ ...value, excerpt })} multiline />
      <LocalizedField label="مدة القراءة" value={value.readTime} onChange={(readTime) => onChange({ ...value, readTime })} />
      <Tabs defaultValue="ar" className="grid gap-3">
        <TabsList className="justify-self-start">
          <TabsTrigger value="ar">نص المقال بالعربي</TabsTrigger>
          <TabsTrigger value="en">English body</TabsTrigger>
        </TabsList>
        <TabsContent value="ar">
          <BlocksEditor dir="rtl" value={value.body.ar} onChange={(ar) => onChange({ ...value, body: { ...value.body, ar } })} />
        </TabsContent>
        <TabsContent value="en">
          <BlocksEditor dir="ltr" value={value.body.en} onChange={(en) => onChange({ ...value, body: { ...value.body, en } })} />
        </TabsContent>
      </Tabs>
    </>
  ),
};
