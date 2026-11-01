import { type MailSettingsInput, mailSettingsSchema, type MailSettingsView } from '@sparkoders/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/features/auth/session';
import { api } from '@/lib/api';

const blank: MailSettingsInput = { host: '', port: 587, secure: false, user: '', password: '', fromName: 'SPARKODERS', fromEmail: '', notifyEmails: [] };

/** SMTP account used for new-enquiry alerts and invitation emails. */
export function MailSettingsPage() {
  const client = useQueryClient();
  const { data: me } = useSession();
  const settings = useQuery({ queryKey: ['settings', 'mail'], queryFn: () => api<MailSettingsView | null>('/settings/mail') });
  const [form, setForm] = useState<MailSettingsInput>(blank);
  const [hasPassword, setHasPassword] = useState(false);
  const [testTo, setTestTo] = useState('');

  useEffect(() => {
    if (settings.data) {
      const { hasPassword: stored, ...rest } = settings.data;
      setForm({ ...rest, password: '' });
      setHasPassword(stored);
    }
  }, [settings.data]);
  useEffect(() => setTestTo((t) => t || me?.email || ''), [me]);

  const save = useMutation({
    mutationFn: (value: MailSettingsInput) => api<MailSettingsView>('/settings/mail', { method: 'PUT', body: value }),
    onSuccess: (data) => {
      client.setQueryData(['settings', 'mail'], data);
      toast.success('تم حفظ إعدادات البريد');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : ''),
  });
  const test = useMutation({
    mutationFn: () => api('/settings/mail/test', { method: 'POST', body: { to: testTo } }),
    onSuccess: () => toast.success(`أُرسلت رسالة تجربة إلى ${testTo}`),
    onError: (e) => toast.error(e instanceof Error ? e.message : ''),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = mailSettingsSchema.safeParse(form);
    if (!parsed.success) return toast.error('راجع الحقول: الخادم، المنفذ، وبريد المرسل.');
    save.mutate(parsed.data);
  };

  if (settings.isPending) return <Skeleton className="h-96 rounded-xl" />;

  return (
    <form onSubmit={submit} className="grid max-w-2xl gap-6">
      <PageHeader
        title="البريد والتنبيهات"
        description="حساب البريد اللي ترسل منه اللوحة: تنبيه بكل طلب جديد، ورسائل دعوة الأعضاء."
        actions={<Button type="submit" disabled={save.isPending}>حفظ</Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle>خادم البريد (SMTP)</CardTitle>
          <CardDescription>من مزوّد بريدكم (Google Workspace، Zoho، أو خدمة مثل Resend و Brevo).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div className="grid gap-2">
              <Label htmlFor="host">الخادم</Label>
              <Input id="host" dir="ltr" placeholder="smtp.example.com" value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="port">المنفذ</Label>
              <Input id="port" dir="ltr" inputMode="numeric" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value.replace(/\D/g, '')) || 0 })} />
            </div>
          </div>
          <label className="flex items-center justify-between text-sm">
            اتصال آمن من البداية (SSL، عادةً المنفذ 465)
            <Switch checked={form.secure} onCheckedChange={(secure) => setForm({ ...form, secure, port: secure ? 465 : 587 })} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="user">اسم المستخدم</Label>
              <Input id="user" dir="ltr" autoComplete="off" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" dir="ltr" autoComplete="new-password" placeholder={hasPassword ? 'محفوظة (اتركها فاضية)' : ''} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fromName">اسم المرسل</Label>
              <Input id="fromName" value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fromEmail">بريد المرسل</Label>
              <Input id="fromEmail" type="email" dir="ltr" placeholder="support@sparkoders.com" value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>من يستلم تنبيه الطلبات</CardTitle>
          <CardDescription>كل عضو عنده صلاحية «طلبات التواصل» يستلم تنبيهًا تلقائيًا. أضف عناوين إضافية هنا (سطر لكل بريد).</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            dir="ltr"
            rows={3}
            defaultValue={form.notifyEmails.join('\n')}
            key={settings.data ? 'loaded' : 'blank'}
            onChange={(e) => setForm({ ...form, notifyEmails: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean) })}
          />
        </CardContent>
      </Card>
      {settings.data && (
        <Card>
          <CardHeader>
            <CardTitle>تجربة الإرسال</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Input dir="ltr" type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} className="max-w-xs" />
            <Button type="button" variant="outline" disabled={test.isPending || !testTo} onClick={() => test.mutate()}>
              <Send /> أرسل رسالة تجربة
            </Button>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
