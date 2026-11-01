import { CollectionPage } from './collection-page';
import { postsConfig, projectsConfig, servicesConfig, teamConfig, testimonialsConfig } from './collections';

const configs = {
  projects: projectsConfig,
  blog: postsConfig,
  services: servicesConfig,
  team: teamConfig,
  testimonials: testimonialsConfig,
} as const;

/** One route component for the five content collections (lazy-loaded together). */
export default function CollectionRoute({ which }: { which: keyof typeof configs }) {
  switch (which) {
    case 'projects':
      return <CollectionPage key={which} config={configs.projects} />;
    case 'blog':
      return <CollectionPage key={which} config={configs.blog} />;
    case 'services':
      return <CollectionPage key={which} config={configs.services} />;
    case 'team':
      return <CollectionPage key={which} config={configs.team} />;
    case 'testimonials':
      return <CollectionPage key={which} config={configs.testimonials} />;
  }
}
