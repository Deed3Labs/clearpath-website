import type { EventGroup } from '@/content/events';

/* Section 02's line icons, one per kind of meeting, drawn as the mockup has
   them. Decorative: the cell's headline names the kind. */
export function KindIcon({ group }: { group: EventGroup }) {
  return (
    <svg className="ic" viewBox="0 0 56 56" aria-hidden="true">
      {group === 'community' && (
        <>
          <rect x="6" y="12" width="20" height="14" />
          <rect x="30" y="12" width="20" height="14" />
          <rect x="6" y="30" width="20" height="14" />
          <rect className="lit" x="30" y="30" width="20" height="14" />
        </>
      )}
      {group === 'investors' && (
        <>
          <rect x="6" y="8" width="44" height="30" />
          <path d="M28 38v10M18 48h20M14 18h16M14 25h24M14 31h10" />
        </>
      )}
      {group === 'governance' && (
        <>
          <path d="M10 26h36v22H10z M20 26V14l14-6 2 4-12 6v8" />
          <path d="M22 36h12" />
        </>
      )}
      {group === 'local' && <path d="M6 48h44M10 44h36M28 6L8 18h40z M14 22v20M24 22v20M32 22v20M42 22v20" />}
    </svg>
  );
}
