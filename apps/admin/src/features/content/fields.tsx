import type { Localized } from '@sparkoders/contracts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

/** One text in both languages, Arabic first. */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
}: {
  label: string;
  value: Localized;
  onChange: (v: Localized) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  const Control = multiline ? Textarea : Input;
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1">
          <Label className="text-muted-foreground text-xs">العربية</Label>
          <Control value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} required={required} rows={multiline ? 3 : undefined} />
        </div>
        <div className="grid gap-1">
          <Label className="text-muted-foreground text-xs">English</Label>
          <Control dir="ltr" value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} rows={multiline ? 3 : undefined} />
        </div>
      </div>
    </fieldset>
  );
}

/** A list of short lines in both languages, one per line. */
export function LocalizedListField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { ar: string[]; en: string[] };
  onChange: (v: { ar: string[]; en: string[] }) => void;
}) {
  const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <p className="text-muted-foreground -mt-1 text-xs">سطر لكل عنصر.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Textarea rows={5} defaultValue={value.ar.join('\n')} onChange={(e) => onChange({ ...value, ar: lines(e.target.value) })} />
        <Textarea rows={5} dir="ltr" defaultValue={value.en.join('\n')} onChange={(e) => onChange({ ...value, en: lines(e.target.value) })} />
      </div>
    </fieldset>
  );
}
