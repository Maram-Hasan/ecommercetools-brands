import { useState } from 'react';
export function ProductImage({
  src,
  name,
  eager = false,
}: {
  src?: string;
  name: string;
  eager?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  return src && failedUrl !== src ? (
    <img
      src={src}
      alt={name}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailedUrl(src)}
    />
  ) : (
    <div className="image-placeholder">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="m8 15 16-8 16 8v19l-16 8-16-8V15Z" />
        <path d="m8 15 16 8 16-8M24 23v19M16 11l16 8" />
      </svg>
      <span>No image available</span>
    </div>
  );
}
