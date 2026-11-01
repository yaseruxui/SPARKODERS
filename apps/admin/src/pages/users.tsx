import { PERMISSIONS, type Permission, type UserListItem } from '@sparkoders/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Link2, MoreHorizontal, Trash2, UserPlus } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { UserInfo } from '@/components/user-info';
import { useSession } from '@/features/auth/session';
import { api, ApiError } from '@/lib/api';
import { permissionLabels } from '@/lib/labels';

/** Full admin switch + the individual areas (when not a full admin). */
function PermissionsField({ value, onChange }: { value: Permission[] | null; onChange: (v: Permission[] | null) => void }) {
  return (
    <div className="grid gap-3">
      <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
        <span>
          <span className="block text-sm font-medium">مدير بصلاحيات كاملة</span>
          <span className="text-muted-foreground text-xs">يدخل كل الأقسام ويدير المستخدمين.</span>
        </span>
        <Switch checked={value === null} onCheckedChange={(on) => onChange(on ? null : ['inbox'])} />
      </label>
      {value !== null && (
        <div className="grid grid-cols-2 gap-2">
          {PERMISSIONS.filter((p) => p !== 'users').map((p) => (
            <label key={p} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={value.includes(p)}
                onCheckedChange={(on) => onChange(on ? [...value, p] : value.filter((x) => x !== p))}
              />
              {permissionLabels[p]}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function CopyLink({ url }: { url: string }) {
  return (
    <div className="grid gap-2">
      <p className="text-muted-foreground text-sm">
        إذا كان البريد مضبوطًا وصلته الدعوة بالبريد؛ وإلا أرسل له هذا الرابط ليختار كلمة مروره. الرابط صالح لمدة 7 أيام.
      </p>
      <div className="flex gap-2">
        <Input value={url} readOnly dir="ltr" className="text-xs" />
        <Button
          type="button"
          variant="secondary"
          onClick={() => void navigator.clipboard.writeText(url).then(() => toast.success('تم نسخ الرابط'))}
        >
          <Copy /> نسخ
        </Button>
      </div>
    </div>
  );
}

function PermissionBadges({ user }: { user: UserListItem }) {
  if (user.permissions === null) return <Badge className="bg-brand text-[#14072a]">مدير</Badge>;
  return (
    <div className="flex flex-wrap gap-1">
      {user.permissions.map((p) => (
        <Badge key={p} variant="secondary">
          {permissionLabels[p]}
        </Badge>
      ))}
    </div>
  );
}

export function UsersPage() {
  const client = useQueryClient();
  const { data: me } = useSession();
  const users = useQuery({ queryKey: ['users'], queryFn: () => api<UserListItem[]>('/users') });
  const refresh = () => client.invalidateQueries({ queryKey: ['users'] });

  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitePerms, setInvitePerms] = useState<Permission[] | null>(['inbox']);
  const [inviteError, setInviteError] = useState('');
  const [link, setLink] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const [editPerms, setEditPerms] = useState<Permission[] | null>(null);
  const [deleting, setDeleting] = useState<UserListItem | null>(null);

  const invite = useMutation({
    mutationFn: (body: { name: string; email: string; permissions: Permission[] | null }) =>
      api<{ invitationUrl: string; emailed: boolean }>('/users', { method: 'POST', body }),
    onSuccess: (data) => {
      setInviteOpen(false);
      setLink(data.invitationUrl);
      if (data.emailed) toast.success('أُرسلت الدعوة بالبريد');
      void refresh();
    },
    onError: (e) => setInviteError(e instanceof Error ? e.message : ''),
  });
  const reinvite = useMutation({
    mutationFn: (id: string) => api<{ invitationUrl: string; emailed: boolean }>(`/users/${id}/invitation`, { method: 'POST' }),
    onSuccess: (data) => {
      setLink(data.invitationUrl);
      if (data.emailed) toast.success('أُرسلت الدعوة بالبريد');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : ''),
  });
  const save = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: Permission[] | null }) =>
      api(`/users/${id}`, { method: 'PATCH', body: { permissions } }),
    onSuccess: () => {
      toast.success('تم حفظ الصلاحيات');
      setEditing(null);
      void refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : ''),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('تم حذف المستخدم');
      setDeleting(null);
      void refresh();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : ''),
  });

  const submitInvite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setInviteError('');
    invite.mutate({ name: String(form.get('name') ?? ''), email: String(form.get('email') ?? ''), permissions: invitePerms });
  };

  return (
    <div className="grid gap-6">
      <PageHeader
        title="المستخدمون"
        description="أعضاء الفريق اللي يدخلون لوحة التحكم، وصلاحية كل واحد."
        actions={
          <Button
            onClick={() => {
              setInvitePerms(['inbox']);
              setInviteError('');
              setInviteOpen(true);
            }}
          >
            <UserPlus /> دعوة عضو
          </Button>
        }
      />

      {users.isPending ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : (
        <ul className="bg-card divide-y rounded-xl border">
          {users.data?.map((user) => (
            <li key={user.id} className="flex flex-wrap items-center gap-4 px-4 py-3">
              <div className="flex min-w-48 flex-1 items-center gap-2">
                <UserInfo user={user} showEmail />
              </div>
              <PermissionBadges user={user} />
              <span className="text-muted-foreground w-36 text-xs">
                {user.invitationPending ? (
                  <Badge variant="outline">بانتظار التفعيل</Badge>
                ) : user.lastLoginAt ? (
                  `آخر دخول ${timeAgo(user.lastLoginAt)}`
                ) : (
                  'لم يدخل بعد'
                )}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="خيارات">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={user.id === me?.id}
                    onSelect={() => {
                      setEditing(user);
                      setEditPerms(user.permissions);
                    }}
                  >
                    تعديل الصلاحيات
                  </DropdownMenuItem>
                  {user.invitationPending && (
                    <DropdownMenuItem onSelect={() => reinvite.mutate(user.id)}>
                      <Link2 /> رابط دعوة جديد
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem disabled={user.id === me?.id} className="text-destructive" onSelect={() => setDeleting(user)}>
                    <Trash2 /> حذف
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>دعوة عضو جديد</DialogTitle>
            <DialogDescription>بننشئ له رابط يختار فيه كلمة مروره.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitInvite} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input id="name" name="name" required minLength={2} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" dir="ltr" required />
            </div>
            <PermissionsField value={invitePerms} onChange={setInvitePerms} />
            <InputError message={inviteError} />
            <DialogFooter>
              <Button type="submit" disabled={invite.isPending}>
                إنشاء الدعوة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!link} onOpenChange={(open) => !open && setLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رابط الدعوة جاهز</DialogTitle>
          </DialogHeader>
          {link && <CopyLink url={link} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>صلاحيات {editing?.name}</DialogTitle>
          </DialogHeader>
          <PermissionsField value={editPerms} onChange={setEditPerms} />
          <DialogFooter>
            <Button disabled={save.isPending} onClick={() => editing && save.mutate({ id: editing.id, permissions: editPerms })}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف {deleting?.name}؟</AlertDialogTitle>
            <AlertDialogDescription>بيفقد الوصول للوحة التحكم فورًا. ملاحظاته على الطلبات تبقى بدون اسم.</AlertDialogDescription>
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
