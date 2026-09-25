import { useState } from 'react';
import { useBrand } from '../../brands/context';
import { ProductImage } from '../../components/ProductImage';
import { Modal } from '../../components/Primitives';

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const brand = useBrand();
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  return (
    <div className="product-gallery" data-gallery={brand.gallery}>
      <div className="gallery-thumbnails">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            className={index === i ? 'selected' : ''}
            aria-label={`View image ${i + 1}`}
            aria-pressed={index === i}
            onClick={() => setIndex(i)}
          >
            <img src={src} alt={`${name}, view ${i + 1}`} />
          </button>
        ))}
      </div>
      <div className="gallery-main">
        <button
          className="gallery-zoom"
          aria-label="Enlarge product image"
          disabled={!images.length}
          onClick={() => setZoom(true)}
        >
          <div className="gallery-image">
            <ProductImage src={images[index] ?? images[0]} name={name} eager />
          </div>
          <span>＋ View larger</span>
        </button>
        <p>
          {images.length > 1
            ? `${index + 1} / ${images.length}`
            : 'Product view'}
        </p>
      </div>
      {zoom && (
        <Modal title={name} onClose={() => setZoom(false)}>
          <div className="zoom-image">
            <ProductImage src={images[index]} name={name} />
          </div>
        </Modal>
      )}
    </div>
  );
}
