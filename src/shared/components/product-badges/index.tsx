export function ProductBadges({
  badges,
  className = '',
}: {
  badges?: string[];
  className?: string;
}) {
  if (!badges?.length) return null;
  return (
    <div className={`product-badges ${className}`} aria-label="Product badges">
      {badges.map((badge) => (
        <span className="product-badge" key={badge}>
          {badge}
        </span>
      ))}
    </div>
  );
}
