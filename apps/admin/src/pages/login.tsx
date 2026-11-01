import type { SessionUser } from '@sparkoders/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sessionKey, useSession } from '@/features/auth/session';
import { AuthLayout } from '@/layouts/auth-layout';
import { api, ApiError } from '@/lib/api';

export function LoginPage() {
  const { data: user } = useSession();
  const client = useQueryClient();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      const signedIn = await api<SessionUser>('/auth/login', {
        method: 'POST',
        body: { email: form.get('email'), password: form.get('password') },
      });
      client.setQueryData(sessionKey, signedIn);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e instanceof ApiError && e.status === 429 ? 'محاولات كثيرة، انتظر دقيقة ثم حاول مرة أخرى.' : e instanceof Error ? e.message : '');
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout title="تسجيل الدخول" description="أدخل بريدك وكلمة المرور للدخول إلى لوحة التحكم.">
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" dir="ltr" required autoFocus autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input id="password" name="password" type="password" dir="ltr" required autoComplete="current-password" />
        </div>
        <InputError message={error} />
        <Button type="submit" disabled={pending} className="w-full">
          {pending && <LoaderCircle className="animate-spin" />}
          دخول
        </Button>
      </form>
    </AuthLayout>
  );
}
