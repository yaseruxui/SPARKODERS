import type { SessionUser } from '@sparkoders/contracts';
import {
  BookOpen,
  FileText,
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Settings,
  Sparkles,
  Users,
  UsersRound,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AppLogo } from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { can, useSignOut } from '@/features/auth/session';
import type { NavGroup } from '@/types';

const navGroups: NavGroup[] = [
  {
    title: 'عام',
    items: [
      { title: 'نظرة عامة', url: '/', icon: LayoutDashboard },
      { title: 'طلبات التواصل', url: '/inbox', icon: Inbox, permission: 'inbox' },
      { title: 'المستخدمون', url: '/users', icon: Users, permission: 'users' },
    ],
  },
  {
    title: 'محتوى الموقع',
    items: [
      { title: 'المشاريع', url: '/projects', icon: FolderKanban, permission: 'projects', soon: true },
      { title: 'المدونة', url: '/blog', icon: BookOpen, permission: 'blog', soon: true },
      { title: 'الخدمات', url: '/services', icon: Sparkles, permission: 'content', soon: true },
      { title: 'الفريق', url: '/team', icon: UsersRound, permission: 'content', soon: true },
      { title: 'آراء العملاء', url: '/testimonials', icon: MessageSquareQuote, permission: 'content', soon: true },
      { title: 'نصوص الصفحات', url: '/pages', icon: FileText, permission: 'content', soon: true },
    ],
  },
  {
    title: 'الوسائط',
    items: [{ title: 'مكتبة الوسائط', url: '/media', icon: Images, permission: 'media', soon: true }],
  },
];

const activeClass =
  'data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:before:bg-brand data-[active=true]:ring-foreground/10 relative group-data-[collapsible=icon]:before:hidden data-[active=true]:font-semibold data-[active=true]:shadow-xs data-[active=true]:ring-1 data-[active=true]:before:absolute data-[active=true]:before:inset-y-1.5 data-[active=true]:before:end-0 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-full';

export function AppSidebar({ user, unread }: { user: SessionUser; unread: number }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const signOut = useSignOut();

  return (
    <Sidebar side="right" collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => {
          // Only what this user may open; a group with nothing left is dropped.
          const items = group.items.filter((item) => !item.permission || can(user, item.permission));
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.title} className="px-2 py-0">
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    {item.soon ? (
                      <SidebarMenuButton disabled tooltip={{ children: `${item.title} (قريبًا)`, side: 'left' }} className="opacity-50">
                        <item.icon />
                        <span>{item.title}</span>
                        <Badge variant="outline" className="ms-auto h-5 px-1.5 text-[10px]">
                          قريبًا
                        </Badge>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={activeClass}
                        tooltip={{ children: item.title, side: 'left' }}
                        isActive={item.url === '/' ? pathname === '/' : pathname.startsWith(item.url)}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                          {item.url === '/inbox' && unread > 0 && (
                            <Badge className="bg-brand ms-auto h-5 rounded-full px-1.5 text-[10px] font-bold text-[#14072a]">{unread}</Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarSeparator className="bg-foreground/15 mx-4 my-1 w-auto group-data-[collapsible=icon]:mx-3" />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <UserInfo user={user} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-60">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <UserInfo user={user} showEmail />
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate('/settings')}>
                  <Settings />
                  الإعدادات
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={async () => {
                    await signOut();
                    navigate('/login');
                  }}
                >
                  <LogOut />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
