import '@/styles/app.css';
import { DirectionProvider } from '@radix-ui/react-direction';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { AppError, ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSession, can } from '@/features/auth/session';
import { AppLayout, Forbidden } from '@/layouts/app-layout';
import { InvitationPage } from '@/pages/invitation';
import { LoginPage } from '@/pages/login';
import type { Permission } from '@sparkoders/contracts';
import type { ReactNode } from 'react';

// Each screen loads when it is first opened, keeping the sign-in page light.
const DashboardPage = lazy(() => import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })));
const InboxPage = lazy(() => import('@/pages/inbox').then((m) => ({ default: m.InboxPage })));
const SettingsPage = lazy(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })));
const UsersPage = lazy(() => import('@/pages/users').then((m) => ({ default: m.UsersPage })));
const ContactSettingsPage = lazy(() => import('@/pages/contact-settings').then((m) => ({ default: m.ContactSettingsPage })));
const MediaPage = lazy(() => import('@/pages/media').then((m) => ({ default: m.MediaPage })));
const MailSettingsPage = lazy(() => import('@/pages/mail-settings').then((m) => ({ default: m.MailSettingsPage })));
const TextsPage = lazy(() => import('@/pages/texts').then((m) => ({ default: m.TextsPage })));
/** Content editors share one chunk (the collection page and its five configurations). */
const Collection = lazy(() => import('@/features/content/collection-route'));

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
      { path: 'projects', element: <Gate permission="projects"><Collection which="projects" /></Gate> },
      { path: 'blog', element: <Gate permission="blog"><Collection which="blog" /></Gate> },
      { path: 'services', element: <Gate permission="content"><Collection which="services" /></Gate> },
      { path: 'team', element: <Gate permission="content"><Collection which="team" /></Gate> },
      { path: 'testimonials', element: <Gate permission="content"><Collection which="testimonials" /></Gate> },
      { path: 'texts', element: <Gate permission="content"><TextsPage /></Gate> },
      { path: 'contact', element: <Gate permission="content"><ContactSettingsPage /></Gate> },
      { path: 'media', element: <Gate permission="media"><MediaPage /></Gate> },
      { path: 'mail', element: <Gate permission="users"><MailSettingsPage /></Gate> },
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
            <Suspense fallback={<div className="bg-background min-h-svh" />}>
              <RouterProvider router={router} />
            </Suspense>
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </DirectionProvider>
  </StrictMode>,
);
