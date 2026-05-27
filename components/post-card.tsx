import Image from "next/image";
import Link from "next/link";
import type { Content } from "@/lib/posts";
import { categoryLabel } from "@/lib/categories";
import { formatDate, isoDate } from "@/lib/format";

interface PostCardProps {
  post: Content;
  size?: "default" | "feature";
  priority?: boolean;
}

export function PostCard({
  post,
  size = "default",
  priority = false,
}: PostCardProps) {
  const isFeature = size === "feature";
  return (
    <article
      className={`card-lift group relative flex flex-col overflow-hidden rounded-card bg-surface border border-border ${
        isFeature ? "md:flex-row" : ""
      }`}
    >
      {post.heroImage ? (
        <Link
          href={`/${post.category}/${post.slug}`}
          className={`relative block overflow-hidden ${
            isFeature
              ? "md:w-3/5 aspect-[16/10] md:aspect-[4/3]"
              : "aspect-[4/3]"
          }`}
          tabIndex={-1}
          aria-hidden="true"
        >
          <Image
            src={post.heroImage}
            alt=""
            fill
            sizes={
              isFeature
                ? "(min-width: 768px) 60vw, 100vw"
                : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            priority={priority}
          />
        </Link>
      ) : (
        <div
          className={`bg-accent-soft/60 ${
            isFeature ? "md:w-3/5 aspect-[16/10] md:aspect-[4/3]" : "aspect-[4/3]"
          }`}
        />
      )}

      <div
        className={`flex flex-1 flex-col p-5 ${
          isFeature ? "md:p-8 md:justify-center md:w-2/5" : ""
        }`}
      >
        <Link
          href={`/${post.category}`}
          className="self-start text-[11px] font-medium uppercase tracking-[0.14em] text-accent hover:text-primary transition-colors"
        >
          {categoryLabel(post.category)}
        </Link>

        <h2
          className={`mt-3 font-medium tracking-tight text-fg group-hover:text-primary transition-colors ${
            isFeature ? "text-2xl md:text-3xl leading-[1.15]" : "text-lg leading-snug"
          }`}
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          <Link
            href={`/${post.category}/${post.slug}`}
            className="after:absolute after:inset-0"
          >
            <span className="line-clamp-3">{post.title}</span>
          </Link>
        </h2>

        {post.excerpt && (
          <p
            className={`mt-3 text-sm text-fg-muted leading-relaxed ${
              isFeature ? "line-clamp-3 md:text-base" : "line-clamp-2"
            }`}
          >
            {post.excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-fg-muted">
          <time dateTime={isoDate(post.date)}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </article>
  );
}
