import type { StatusCounts } from '@sparkoders/contracts';
import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { ErrorBoundary, PageError } from '@/components/error-boundary';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { can, useSession } from '@/features/auth/session';
import { api } from '@/lib/api';

/** Signed-in frame: sidebar + page. Signed-out visitors go to /login. */
export function AppLayout() {
  const { data: user, isPending } = useSession();
  const location = useLocation();
  const counts = useQuery({
    queryKey: ['inbox', 'counts'],
    queryFn: () => api<StatusCounts>('/inbox/counts'),
    enabled: can(user, 'inbox'),
    refetchInterval: 60_000,
  });

  if (isPending) return <div className="bg-background min-h-svh" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <AppShell variant="sidebar">
      <AppSidebar user={user} unread={counts.data?.new ?? 0} />
      <AppContent variant="sidebar">
        <header className="border-sidebar-border/50 flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger className="-ms-1" />
          <span className="text-sm font-semibold">SPARKODERS</span>
        </header>
        <ErrorBoundary fallback={PageError} resetKey={location.pathname}>
          <div className="max-w-page mx-auto w-full p-4 md:p-8">
            <Outlet />
          </div>
        </ErrorBoundary>
      </AppContent>
    </AppShell>
  );
}

/** For a route the user lacks permission for. */
export function Forbidden() {
  return (
    <div className="text-muted-foreground grid min-h-[50vh] place-items-center text-center">
      ليس لديك صلاحية لهذا القسم.
    </div>
  );
}
