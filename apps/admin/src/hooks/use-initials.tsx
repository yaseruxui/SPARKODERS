export function useInitials() {
  return (fullName: string): string => {
    const names = fullName.trim().split(/\s+/).filter(Boolean);
    const first = names[0]?.charAt(0) ?? '';
    const last = names.length > 1 ? (names[names.length - 1]?.charAt(0) ?? '') : '';
    return `${first}${last}`.toUpperCase();
  };
}
