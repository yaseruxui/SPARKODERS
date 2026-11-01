import type { SessionUser } from '@sparkoders/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { sessionKey, useSession } from '@/features/auth/session';
import { api } from '@/lib/api';

export function SettingsPage() {
  const { data: user } = useSession();
  const client = useQueryClient();
  const [passwordError, setPasswordError] = useState('');
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  if (!user) return null;

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get('name') ?? '');
    try {
      client.setQueryData(sessionKey, await api<SessionUser>('/auth/me', { method: 'PATCH', body: { name } }));
      toast.success('تم حفظ الاسم');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '');
    }
  };

  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const password = String(form.get('password') ?? '');
    if (password !== form.get('confirm')) return setPasswordError('كلمتا المرور غير متطابقتين.');
    setPasswordError('');
    try {
      await api('/auth/me/password', { method: 'PUT', body: { currentPassword: form.get('currentPassword'), password } });
      formEl.reset();
      toast.success('تم تغيير كلمة المرور، وتم تسجيل الخروج من الأجهزة الأخرى.');
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : '');
    }
  };

  const toggleTheme = (on: boolean) => {
    setDark(on);
    document.documentElement.classList.toggle('dark', on);
    try {
      localStorage.setItem('appearance', on ? 'dark' : 'light');
    } catch {
      /* private mode: the choice lasts until reload */
    }
  };

  return (
    <div className="grid max-w-2xl gap-6">
      <PageHeader title="الإعدادات" />
      <Card>
        <CardHeader>
          <CardTitle>الملف الشخصي</CardTitle>
          <CardDescription dir="ltr" className="text-end rtl:text-start">{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="flex items-end gap-3">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" name="name" defaultValue={user.name} required minLength={2} />
            </div>
            <Button type="submit">حفظ</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>كلمة المرور</CardTitle>
          <CardDescription>تغييرها يسجّل خروجك من كل الأجهزة الأخرى.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
              <Input id="currentPassword" name="currentPassword" type="password" dir="ltr" required autoComplete="current-password" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                <Input id="password" name="password" type="password" dir="ltr" required minLength={8} autoComplete="new-password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">تأكيدها</Label>
                <Input id="confirm" name="confirm" type="password" dir="ltr" required minLength={8} autoComplete="new-password" />
              </div>
            </div>
            <InputError message={passwordError} />
            <Button type="submit" className="justify-self-start">
              تغيير كلمة المرور
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>المظهر</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center justify-between">
            <span className="text-sm">الوضع الداكن</span>
            <Switch checked={dark} onCheckedChange={toggleTheme} />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
