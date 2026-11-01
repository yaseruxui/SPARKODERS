import type { SessionUser } from '@sparkoders/contracts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sessionKey } from '@/features/auth/session';
import { AuthLayout } from '@/layouts/auth-layout';
import { api } from '@/lib/api';

/** Where an invited teammate chooses a password; they are signed in right after. */
export function InvitationPage() {
  const { token = '' } = useParams();
  const client = useQueryClient();
  const navigate = useNavigate();
  const invitation = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => api<{ name: string; email: string }>(`/auth/invitation/${encodeURIComponent(token)}`),
    retry: false,
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (invitation.isError) {
    return (
      <AuthLayout title="رابط غير صالح" description="رابط الدعوة غير صالح أو انتهت صلاحيته. اطلب من المدير رابطًا جديدًا.">
        <Button className="w-full" onClick={() => navigate('/login')}>
          الذهاب لتسجيل الدخول
        </Button>
      </AuthLayout>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    if (password !== form.get('confirm')) return setError('كلمتا المرور غير متطابقتين.');
    if (password.length < 8) return setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
    setPending(true);
    setError('');
    try {
      const user = await api<SessionUser>('/auth/invitation', { method: 'POST', body: { token, password } });
      client.setQueryData(sessionKey, user);
      navigate('/', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : '');
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title={invitation.data ? `أهلًا ${invitation.data.name}` : 'تفعيل الحساب'}
      description="اختر كلمة مرور لحسابك في لوحة التحكم."
    >
      <form onSubmit={submit} className="grid gap-5">
        {invitation.data && (
          <div className="grid gap-2">
            <Label>البريد الإلكتروني</Label>
            <Input value={invitation.data.email} dir="ltr" disabled readOnly />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" name="password" type="password" dir="ltr" required minLength={8} autoComplete="new-password" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
          <Input id="confirm" name="confirm" type="password" dir="ltr" required minLength={8} autoComplete="new-password" />
        </div>
        <InputError message={error} />
        <Button type="submit" disabled={pending || invitation.isPending} className="w-full">
          {pending && <LoaderCircle className="animate-spin" />}
          تفعيل الحساب
        </Button>
      </form>
    </AuthLayout>
  );
}
