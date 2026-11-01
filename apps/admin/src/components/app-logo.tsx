import mark from '@/assets/sparkoders-mark.webp';

/** The S mark with the product name; collapsed to icons, only the mark shows. */
export function AppLogo() {
  return (
    <>
      <span className="flex size-8 shrink-0 items-center justify-center">
        <img src={mark} alt="" className="h-auto w-7" />
      </span>
      <span className="grid flex-1 text-start leading-tight">
        <span dir="ltr" className="truncate text-end text-sm font-bold tracking-wide rtl:text-start">
          SPARKODERS
        </span>
        <span className="text-muted-foreground truncate text-xs">لوحة التحكم</span>
      </span>
    </>
  );
}
