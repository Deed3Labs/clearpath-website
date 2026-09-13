import type { PlateTone } from '@/content/shop';

/* A wrapped parcel, drawn in the same line as the product plates. The closed
   shop shows these instead of products: it says "there are things here"
   without saying what, which is the point — and it does not invent goods
   that have not been decided. */
export function Parcel({ tone, tilt = 0 }: { tone: PlateTone; tilt?: number }) {
  return (
    <div className="shop-plate shop-parcel" data-tone={tone} aria-hidden="true">
      <svg viewBox="0 0 400 400">
        <g transform={`rotate(${tilt} 200 240)`}>
          {/* Box, then the lid over it. */}
          <path className="shop-plate-body" d="M116 178 H284 V330 H116 Z" />
          <path className="shop-plate-body" d="M106 150 H294 V182 H106 Z" />
          {/* Twine, both ways round. */}
          <path className="shop-plate-line" d="M200 150 V330 M116 262 H284" />
          {/* The bow. */}
          <path
            className="shop-plate-line"
            d="M200 150 C178 112 146 126 158 146 C166 158 186 156 200 150 C214 156 234 158 242 146 C254 126 222 112 200 150 M200 150 L184 176 M200 150 L218 178"
          />
          {/* A tag on a string, face down. */}
          <path className="shop-plate-line" d="M206 152 Q244 170 262 200" />
          <path className="shop-plate-body shop-parcel-tag" d="M252 196 L306 212 L294 254 L240 238 Z" />
          <circle className="shop-plate-line" cx="258" cy="206" r="4" />
        </g>
      </svg>
    </div>
  );
}
