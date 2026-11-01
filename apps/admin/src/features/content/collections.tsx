import { SERVICE_ICONS, type ServiceIcon } from '@sparkoders/contracts';
import { MessageSquareQuote, Sparkles, UsersRound } from 'lucide-react';
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
