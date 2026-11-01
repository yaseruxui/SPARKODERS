import type { InterestKey, MessageStatus, Permission } from '@sparkoders/contracts';

export const statusLabels: Record<MessageStatus, string> = {
  new: 'جديدة',
  in_progress: 'قيد المتابعة',
  replied: 'تم الرد',
  closed: 'مغلقة',
  spam: 'مزعجة',
};

export const statusTone: Record<MessageStatus, string> = {
  new: 'bg-brand text-[#14072a]',
  in_progress: 'bg-amber-400/90 text-amber-950',
  replied: 'bg-emerald-500/90 text-emerald-950',
  closed: 'bg-muted text-muted-foreground',
  spam: 'bg-destructive/80 text-white',
};

export const interestLabels: Record<InterestKey, string> = {
  website: 'موقع إلكتروني',
  store: 'متجر إلكتروني',
  app: 'تطبيق جوال',
  branding: 'هوية وتسويق',
  seo: 'محركات البحث',
  ai: 'ذكاء اصطناعي',
};

export const permissionLabels: Record<Permission, string> = {
  inbox: 'طلبات التواصل',
  content: 'محتوى الموقع',
  projects: 'المشاريع',
  blog: 'المدونة',
  media: 'الوسائط',
  users: 'المستخدمون',
};
