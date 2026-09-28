import { useRef, useState } from 'react';
import { ProductImage } from '../../../shared/components/product-image';
import { Modal } from '../../../shared/components/primitives';
import type { ProductGalleryProps } from '../../../shared/containers/universal-pdp/partials/ProductGallery';

export function GarnetHillProductGallery({
  images,
  name,
}: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const gallery = useRef<HTMLDivElement | null>(null);
  const panels = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    setSelected(index);
    gallery.current?.scrollTo({
      behavior: 'smooth',
      top: panels.current[index]?.offsetTop ?? 0,
    });
  };

  return (
    <div className="product-gallery gh-product-gallery">
      <div className="gallery-thumbnails" aria-label="Product images">
        {images.map((src, index) => (
          <button
            type="button"
            key={`${src}-${index}`}
            className={selected === index ? 'selected' : ''}
            aria-label={`View image ${index + 1}`}
            aria-pressed={selected === index}
            onClick={() => select(index)}
          >
            <img src={src} alt={`${name}, view ${index + 1}`} />
          </button>
        ))}
      </div>
      <div
        className="gallery-main"
        ref={gallery}
        tabIndex={0}
        aria-label="Large product images"
      >
        {images.map((src, index) => (
          <button
            type="button"
            key={`${src}-large-${index}`}
            ref={(element) => {
              panels.current[index] = element;
            }}
            className={`gallery-zoom gh-gallery-panel${selected === index ? ' selected' : ''}`}
            aria-label={`Enlarge product image ${index + 1}`}
            onClick={() => {
              setSelected(index);
              setZoom(true);
            }}
          >
            <div className="gallery-image">
              <ProductImage
                src={src}
                name={`${name}, view ${index + 1}`}
                eager={index === 0}
              />
            </div>
          </button>
        ))}
      </div>
      {zoom && (
        <Modal title={name} onClose={() => setZoom(false)}>
          <div className="zoom-image">
            <ProductImage src={images[selected]} name={name} />
          </div>
        </Modal>
      )}
    </div>
  );
}
