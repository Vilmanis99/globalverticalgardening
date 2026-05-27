interface FieldTestProductProps {
  /** The product's full name */
  name: string;
  /** Brand or manufacturer */
  brand?: string;
  /** Active ingredient(s), if applicable */
  activeIngredient?: string;
  /** Local-currency price as written (e.g. "€18", "$24") */
  price?: string;
  /** Where Karlis bought it (e.g. "Depo (Latvia)", "Amazon", "local hardware store") */
  store?: string;
  /** Optional product photo path (local /images/... or /garden/...) */
  image?: string;
  /** Optional purchase link — affiliate-link if you have one */
  url?: string;
  /** True if Karlis personally tested THIS product. False (default) = listed as a similar/alternative product. */
  tested?: boolean;
  /** One-line summary or notes */
  notes?: string;
}

/**
 * A product card for "Field Test" articles. Renders product details with a
 * visible "Tested by me" or "Closest equivalent — not tested" badge so readers
 * always know whether the writer used this exact product.
 *
 * Usage in MDX:
 *
 *   <FieldTestProduct
 *     name="Substral Anti-Ant Granules"
 *     brand="Substral"
 *     activeIngredient="permethrin"
 *     price="€12"
 *     store="Depo (Latvia)"
 *     tested={true}
 *     image="/path/to/photo.jpg"
 *     notes="Granular bait, sprinkled around the foundation"
 *   />
 */
export function FieldTestProduct({
  name,
  brand,
  activeIngredient,
  price,
  store,
  image,
  url,
  tested,
  notes,
}: FieldTestProductProps) {
  const isExternal = url && /^https?:\/\//.test(url);
  const isAffiliate =
    isExternal && /(?:amzn\.to|amazon\.[a-z.]+|shareasale\.com)/i.test(url);

  const card = (
    <div className="not-prose group my-6 flex items-stretch overflow-hidden rounded-card border border-border bg-surface card-lift max-w-xl">
      <div className="relative w-32 sm:w-40 shrink-0 overflow-hidden bg-accent-soft/30 flex items-center justify-center text-fg-muted text-xs">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={`${name} packaging`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-center px-2">Photo coming</span>
        )}
      </div>
      <div className="flex flex-1 min-w-0 flex-col justify-center gap-1 px-4 py-3">
        <div className="flex items-center gap-2">
          {tested === true ? (
            <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium px-2 py-0.5 rounded-full bg-primary text-primary-fg">
              Tested by me
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] font-medium px-2 py-0.5 rounded-full border border-border bg-bg/40 text-fg-muted">
              Closest equivalent · not tested
            </span>
          )}
          {isAffiliate && (
            <span className="text-[10px] uppercase tracking-[0.14em] text-fg-muted">
              Affiliate
            </span>
          )}
        </div>
        <p
          className="mt-0.5 text-base font-medium leading-tight text-fg"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {name}
        </p>
        {brand && (
          <p className="text-xs text-fg-muted">{brand}</p>
        )}
        <ul className="mt-1 text-xs text-fg-muted space-y-0.5">
          {activeIngredient && (
            <li>
              <span className="text-fg-muted/80">Active:</span>{" "}
              {activeIngredient}
            </li>
          )}
          {price && (
            <li>
              <span className="text-fg-muted/80">Price:</span> {price}
            </li>
          )}
          {store && (
            <li>
              <span className="text-fg-muted/80">Bought at:</span> {store}
            </li>
          )}
          {notes && <li className="text-fg/80 italic mt-1">{notes}</li>}
        </ul>
        {url && (
          <span className="mt-2 inline-flex text-sm font-medium text-primary group-hover:translate-x-0.5 transition-transform">
            {isAffiliate ? "View on Amazon →" : "More info →"}
          </span>
        )}
      </div>
    </div>
  );

  if (!url) return card;

  return (
    <a
      href={url}
      target={isExternal ? "_blank" : undefined}
      rel={
        isAffiliate
          ? "sponsored nofollow noopener"
          : isExternal
            ? "noopener noreferrer"
            : undefined
      }
      className="no-underline block"
    >
      {card}
    </a>
  );
}
