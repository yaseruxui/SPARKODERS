import '@/styles/app.css';
import { DirectionProvider } from '@radix-ui/react-direction';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { AppError, ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSession, can } from '@/features/auth/session';
import { AppLayout, Forbidden } from '@/layouts/app-layout';
import { DashboardPage } from '@/pages/dashboard';
import { InboxPage } from '@/pages/inbox';
import { InvitationPage } from '@/pages/invitation';
import { LoginPage } from '@/pages/login';
import { SettingsPage } from '@/pages/settings';
import { UsersPage } from '@/pages/users';
import type { Permission } from '@sparkoders/contracts';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: true, retry: 1 } } });

function Gate({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { data: user } = useSession();
  return can(user, permission) ? children : <Forbidden />;
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/invitation/:token', element: <InvitationPage /> },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'inbox', element: <Gate permission="inbox"><InboxPage /></Gate> },
      { path: 'users', element: <Gate permission="users"><UsersPage /></Gate> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Radix layers (menus, selects, tooltips) render outside the page; this makes them RTL too. */}
    <DirectionProvider dir="rtl">
      <ErrorBoundary fallback={AppError}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={200}>
            <RouterProvider router={router} />
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </DirectionProvider>
  </StrictMode>,
);
