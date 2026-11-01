/** Menu entries, in order; every entry is a page. Labels live in `navigation.items`. */
export const navSections = [
  { key: 'home', page: '/' },
  { key: 'services', page: '/services' },
  { key: 'work', page: '/work' },
  { key: 'about', page: '/about' },
  { key: 'blog', page: '/blog' },
  { key: 'contact', page: '/contact' },
] as const;

export type NavSectionKey = (typeof navSections)[number]['key'];

/** Footer quick links (subset, footer order). */
export const footerSections: readonly NavSectionKey[] = ['services', 'work', 'about', 'blog', 'contact'];
