import type { ComponentProps, ReactElement, ReactNode } from "react";
import { isValidElement } from "react";
import Image from "next/image";
import dims from "@/lib/image-dimensions.json";
import { YieldTable } from "@/components/yield-table";
import { Timeline } from "@/components/timeline";
import { FieldTestProduct } from "@/components/field-test-product";
import { YouTubeEmbed } from "@/components/youtube-embed";

const DIMENSIONS = dims as Record<string, { width: number; height: number }>;

const AFFILIATE_HOSTS = /(?:amzn\.to|amazon\.[a-z.]+|shareasale\.com|impact\.com)/i;

function isLocalImage(src: unknown): src is string {
  return typeof src === "string" && src.startsWith("/");
}

export const mdxComponents = {
  YieldTable,
  Timeline,
  FieldTestProduct,
  YouTubeEmbed,
  img: (props: ComponentProps<"img">) => {
    const src = props.src;
    const alt = props.alt ?? "";
    if (isLocalImage(src)) {
      const dim = DIMENSIONS[src];
      if (dim) {
        return (
          <Image
            src={src}
            alt={alt}
            width={dim.width}
            height={dim.height}
            sizes="(min-width: 768px) 720px, 100vw"
            loading="lazy"
            className="rounded-card border border-border bg-surface"
          />
        );
      }
    }
    // Fallback for any unindexed asset
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        loading="lazy"
        decoding="async"
        alt={alt}
        {...props}
      />
    );
  },
  a: (props: ComponentProps<"a">) => {
    const href = props.href ?? "";
    const external = /^https?:\/\//.test(href);
    const isAffiliate = AFFILIATE_HOSTS.test(href);

    // Affiliate-image-link pattern: <a href="amzn.to/..."><img .../></a>
    // Detect a single image child and upgrade to an AffiliateCard layout.
    const children = props.children;
    const onlyChild = onlyImageChild(children);
    if (isAffiliate && onlyChild) {
      return (
        <a
          href={href}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="not-prose group my-6 flex items-stretch overflow-hidden rounded-card border border-border bg-surface card-lift no-underline max-w-md [&_img]:!border-0 [&_img]:!rounded-none [&_img]:!m-0 [&_img]:!bg-transparent"
        >
          <div className="relative w-28 sm:w-32 shrink-0 overflow-hidden bg-accent-soft/30 [&_img]:!h-full [&_img]:!w-full [&_img]:!object-cover">
            {onlyChild}
          </div>
          <div className="flex flex-1 min-w-0 flex-col justify-center gap-1 px-4 py-3">
            <span className="text-[10px] uppercase tracking-[0.14em] text-fg-muted">
              Affiliate · honest pick
            </span>
            <span className="text-sm font-medium text-primary group-hover:translate-x-0.5 transition-transform">
              View on Amazon →
            </span>
          </div>
        </a>
      );
    }

    if (external) {
      const rel = isAffiliate
        ? "sponsored nofollow noopener"
        : "noopener noreferrer";
      return <a {...props} target="_blank" rel={rel} />;
    }
    return <a {...props} />;
  },
};

function onlyImageChild(children: ReactNode): ReactElement | null {
  // Markdown `[![](img)](url)` renders as a single element child here (already
  // resolved through the components map). If the only child is a single React
  // element (and not text), assume it's the image-link pattern.
  const arr = Array.isArray(children) ? children : [children];
  const real = arr.filter(
    (c) => c != null && !(typeof c === "string" && c.trim() === "")
  );
  if (real.length !== 1) return null;
  const c = real[0];
  if (!isValidElement(c)) return null;
  if (typeof c === "string") return null;
  return c;
}
