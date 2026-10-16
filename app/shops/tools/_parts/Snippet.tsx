import { Fragment } from 'react';
import { ONLINE } from '@/content/shopsTools';

/* The whole integration: one button and one script, as the shop pastes it. */

export function Snippet() {
  return (
    <pre className="code">
      <code>
        {ONLINE.integration.code.map((line, i) => (
          <Fragment key={i}>
            {line.map((r, j) => (r.c ? <span key={j} className={r.c}>{r.t}</span> : <Fragment key={j}>{r.t}</Fragment>))}
            {i < ONLINE.integration.code.length - 1 ? '\n' : null}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}
