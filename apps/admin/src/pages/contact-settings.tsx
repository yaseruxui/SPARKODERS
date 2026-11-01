import { type SiteSettings, siteSettingsSchema } from '@sparkoders/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Phone } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ImportButton } from '@/features/content/collection-page';
import { api } from '@/lib/api';

const socialLabels = { linkedin: 'لينكدإن', instagram: 'إنستغرام', x: 'إكس (تويتر)', behance: 'بيهانس' } as const;

export function ContactSettingsPage() {
  const client = useQueryClient();
  const settings = useQuery({ queryKey: ['content', 'settings'], queryFn: () => api<SiteSettings | null>('/content/settings') });
  const [form, setForm] = useState<SiteSettings | null>(null);
  useEffect(() => setForm(settings.data ?? null), [settings.data]);

  const save = useMutation({
    mutationFn: (value: SiteSettings) => api<SiteSettings>('/content/settings', { method: 'PUT', body: value }),
    onSuccess: (data) => {
      client.setQueryData(['content', 'settings'], data);
      toast.success('تم الحفظ ونُشر على الموقع');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : ''),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form) return;
    const parsed = siteSettingsSchema.safeParse(form);
    if (!parsed.success) return toast.error('تأكد من البريد وأن الروابط تبدأ بـ https://');
    save.mutate(parsed.data);
  };

  if (settings.isPending) return <Skeleton className="h-96 rounded-xl" />;
  if (!form)
    return (
      <div className="grid gap-6">
        <PageHeader title="معلومات التواصل" />
        <EmptyState icon={Phone} title="لم تُستورد بعد" description="الموقع يعرض معلومات التواصل الأصلية. استوردها لتعدّل عليها." action={<ImportButton variant="default" />} />
      </div>
    );

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-6">
      <PageHeader title="معلومات التواصل" description="تظهر في القائمة والفوتر وصفحة التواصل وزر الواتساب." actions={<Button type="submit" disabled={save.isPending}>حفظ</Button>} />
      <Card>
        <CardHeader>
          <CardTitle>التواصل</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" dir="ltr" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" dir="ltr" placeholder="+966 5x xxx xxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">واتساب (أرقام فقط مع رمز الدولة)</Label>
              <Input id="whatsapp" dir="ltr" inputMode="numeric" placeholder="9665xxxxxxxx" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>حسابات السوشال</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {(Object.keys(socialLabels) as (keyof typeof socialLabels)[]).map((key) => (
            <div key={key} className="grid gap-2">
              <Label htmlFor={key}>{socialLabels[key]}</Label>
              <Input id={key} dir="ltr" placeholder="https://" value={form.socials[key]} onChange={(e) => setForm({ ...form, socials: { ...form.socials, [key]: e.target.value } })} />
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  );
}
