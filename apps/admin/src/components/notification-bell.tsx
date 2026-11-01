import type { NotificationList } from '@sparkoders/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Inbox } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { timeAgo } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

/** Bell with the unread count; checks every 30 seconds and toasts when something new arrives. */
export function NotificationBell({ className }: { className?: string }) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const list = useQuery({ queryKey: ['notifications'], queryFn: () => api<NotificationList>('/notifications'), refetchInterval: 30_000 });
  const seen = useRef<string | null>(null);

  useEffect(() => {
    const newest = list.data?.items[0];
    if (!newest) return;
    if (seen.current && seen.current !== newest.id && !newest.read) {
      toast(newest.title, { description: newest.body, action: { label: 'فتح', onClick: () => navigate(newest.link) } });
      void client.invalidateQueries({ queryKey: ['inbox'] });
    }
    seen.current = newest.id;
  }, [list.data, navigate, client]);

  const readAll = useMutation({
    mutationFn: () => api('/notifications/read-all', { method: 'POST' }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const openOne = async (id: string, link: string) => {
    setOpen(false);
    await api(`/notifications/${id}/read`, { method: 'POST' }).catch(() => undefined);
    void client.invalidateQueries({ queryKey: ['notifications'] });
    navigate(link);
  };
  const unread = list.data?.unread ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', className)} aria-label={unread ? `الإشعارات (${unread} غير مقروءة)` : 'الإشعارات'}>
          <Bell />
          {unread > 0 && (
            <span className="bg-brand absolute -top-0.5 -end-0.5 grid min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-[#14072a]">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <span className="text-sm font-semibold">الإشعارات</span>
          {unread > 0 && (
            <button type="button" className="text-muted-foreground hover:text-foreground text-xs" onClick={() => readAll.mutate()}>
              تعليم الكل كمقروء
            </button>
          )}
        </div>
        <ul className="max-h-96 overflow-y-auto">
          {list.data?.items.length ? (
            list.data.items.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => void openOne(n.id, n.link)} className={cn('hover:bg-muted/50 flex w-full gap-3 px-4 py-3 text-start', !n.read && 'bg-brand/[0.06]')}>
                  <Inbox className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  <span className="min-w-0">
                    <span className={cn('block truncate text-sm', !n.read && 'font-semibold')}>{n.title}</span>
                    {n.body && <span className="text-muted-foreground block truncate text-xs">{n.body}</span>}
                    <span className="text-muted-foreground block text-[11px]">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground px-4 py-8 text-center text-sm">لا توجد إشعارات.</li>
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
