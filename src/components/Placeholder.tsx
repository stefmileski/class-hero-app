import type { CSSProperties } from 'react';

interface PlaceholderProps {
  /**
   * Crop as `width / height`. Imagery is full-bleed and hard-cropped, so the
   * ratio is the spec — not a pixel height.
   */
  ratio?: string;
  caption?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Bone-filled slot standing in for real photography. The prototype used a
 * drag-and-drop `<image-slot>`; in the app this is where an <img> goes.
 */
export function Placeholder({ ratio, caption, className, style }: PlaceholderProps) {
  return (
    <div
      className={className ? `slot ${className}` : 'slot'}
      style={{ aspectRatio: ratio, ...style }}
      role="img"
      aria-label={caption || 'Photograph'}
    >
      {caption ? <span className="slot__caption">{caption}</span> : null}
    </div>
  );
}
