import { useEffect, useRef, useState } from 'react';
import { ProductImage } from '../../../components/product-image';
import { Modal } from '../../../components/primitives';
export interface ProductGalleryProps {
  images: string[];
  name: string;
  className?: string;
}

export function ProductGallery({
  images,
  name,
  className = 'responsive-product-gallery',
}: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);
  const gallery = useRef<HTMLDivElement | null>(null);
  const thumbnails = useRef<HTMLDivElement | null>(null);
  const panels = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    setSelected(index);
    if (window.matchMedia('(max-width: 700px)').matches) {
      gallery.current?.scrollTo({
        behavior: 'smooth',
        left: index * gallery.current.clientWidth,
        top: 0,
      });
      return;
    }
    const viewport = gallery.current;
    const panel = panels.current[index];
    if (!viewport || !panel) return;
    viewport.scrollTo({
      behavior: 'smooth',
      top:
        viewport.scrollTop +
        panel.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top,
    });
  };

  useEffect(() => {
    if (!window.matchMedia('(max-width: 700px)').matches) return;
    const strip = thumbnails.current;
    const thumbnail = strip?.children[selected] as HTMLElement | undefined;
    if (!strip || !thumbnail) return;
    const viewport = strip.getBoundingClientRect();
    const item = thumbnail.getBoundingClientRect();
    if (item.left < viewport.left || item.right > viewport.right) {
      strip.scrollBy({
        left:
          item.left < viewport.left
            ? item.left - viewport.left - 16
            : item.right - viewport.right + 16,
        behavior: 'smooth',
      });
    }
  }, [selected]);

  return (
    <div className={`product-gallery ${className}`}>
      <div
        className="gallery-thumbnails"
        ref={thumbnails}
        aria-label="Product images"
      >
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
        onScroll={(event) => {
          if (!window.matchMedia('(max-width: 700px)').matches) return;
          const viewport = event.currentTarget;
          setSelected(
            Math.max(
              0,
              Math.min(
                images.length - 1,
                Math.round(viewport.scrollLeft / viewport.clientWidth),
              ),
            ),
          );
        }}
      >
        {(images.length ? images : ['']).map((src, index) => (
          <button
            type="button"
            key={`${src}-large-${index}`}
            ref={(element) => {
              panels.current[index] = element;
            }}
            className={`gallery-zoom gallery-panel${selected === index ? ' selected' : ''}`}
            aria-label={`Enlarge product image ${index + 1}`}
            disabled={!src}
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
