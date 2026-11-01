import { Reveal } from '@/components/ui/reveal';
import { ProjectArt } from '@/features/home/components/project-art';
import type { Accent } from '@/features/home/types';

export interface PostCardData {
  key: string;
  href: string;
  accent: Accent;
  image: string | null;
  alt: string;
  title: string;
  category: string;
  /** ISO date for <time>, and its formatted label. */
  date: string;
  dateLabel: string;
  excerpt?: string;
}

/** Article teaser used on the home page, the blog index and under each article. */
export function PostCard({ post, index = 0 }: { post: PostCardData; index?: number }) {
  return (
    <Reveal as="article" index={index}>
      <a href={post.href} className="group/post flex flex-col gap-3">
        <ProjectArt
          accent={post.accent}
          image={post.image}
          alt={post.alt}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="aspect-[16/11] rounded-card border border-line transition-transform duration-600 ease-brand group-hover/post:scale-[0.98]"
        />
        <span className="text-[0.8125rem] text-faint">
          {post.category} · <time dateTime={post.date}>{post.dateLabel}</time>
        </span>
        <h3 className="font-display text-[1.3125rem] leading-normal font-semibold transition-colors duration-250 group-hover/post:text-aqua">
          {post.title}
        </h3>
        {post.excerpt ? <p className="line-clamp-3 text-[0.9375rem] text-muted">{post.excerpt}</p> : null}
      </a>
    </Reveal>
  );
}
