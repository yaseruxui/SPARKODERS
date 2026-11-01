import type { InboxMessage, StatusCounts } from '@sparkoders/contracts';
import { MESSAGE_STATUSES } from '@sparkoders/contracts';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Inbox, Users } from 'lucide-react';
import { Link } from 'react-router';
import { EmptyState } from '@/components/empty-state';
import { PageHeader, timeAgo } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/features/auth/session';
import { api } from '@/lib/api';
import { statusLabels, statusTone } from '@/lib/labels';

interface Summary {
  inbox: { counts: StatusCounts; latest: InboxMessage[] } | null;
  users: number | null;
}

export function DashboardPage() {
  const { data: user } = useSession();
  const summary = useQuery({ queryKey: ['dashboard'], queryFn: () => api<Summary>('/dashboard') });
  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <div className="grid gap-8">
      <PageHeader title={`أهلًا ${firstName} 👋`} description="هذا ملخص ما يحتاج انتباهك اليوم." />

      {summary.isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summary.data?.inbox &&
              (['new', 'in_progress'] as const).map((status) => (
                <Link key={status} to={`/inbox?status=${status}`}>
                  <Card className="hover:border-brand/60 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-muted-foreground text-sm font-medium">طلبات {statusLabels[status]}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-bold tabular-nums">{summary.data?.inbox?.counts[status]}</CardContent>
                  </Card>
                </Link>
              ))}
            {summary.data?.inbox && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">كل الطلبات</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold tabular-nums">
                  {MESSAGE_STATUSES.reduce((sum, s) => sum + (summary.data?.inbox?.counts[s] ?? 0), 0)}
                </CardContent>
              </Card>
            )}
            {summary.data?.users !== null && summary.data?.users !== undefined && (
              <Link to="/users">
                <Card className="hover:border-brand/60 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-medium">المستخدمون</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-3xl font-bold tabular-nums">
                    {summary.data.users}
                    <Users className="text-muted-foreground size-5" />
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>

          {summary.data?.inbox && (
            <section className="grid gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">آخر الطلبات</h2>
                <Link to="/inbox" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
                  كل الطلبات <ArrowLeft className="size-4" />
                </Link>
              </div>
              {summary.data.inbox.latest.length === 0 ? (
                <EmptyState icon={Inbox} title="لا توجد طلبات بعد" description="طلبات نموذج التواصل في الموقع ستظهر هنا." />
              ) : (
                <ul className="bg-card divide-y rounded-xl border">
                  {summary.data.inbox.latest.map((message) => (
                    <li key={message.id}>
                      <Link to={`/inbox?open=${message.id}`} className="hover:bg-muted/40 flex items-center gap-4 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {message.name} <span className="text-muted-foreground font-normal">· {message.organisation}</span>
                          </p>
                          <p className="text-muted-foreground truncate text-sm">{message.message || '—'}</p>
                        </div>
                        <Badge className={statusTone[message.status]}>{statusLabels[message.status]}</Badge>
                        <span className="text-muted-foreground hidden text-xs sm:block">{timeAgo(message.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
