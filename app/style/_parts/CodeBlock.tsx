'use client';

import { useEffect, useRef, useState } from 'react';

type Copy = { idle: string; copied: string; failed: string; saidCopied: string; saidFailed: string };

/* A code sample with a copy button: the dot's CSS in the guide.
 *
 * Copy prefers the async Clipboard API and falls back to a hidden textarea
 * and execCommand where that API is unavailable (an http origin, an embedded
 * webview), because a copy button that silently does nothing is worse than
 * none. The result is announced, so a screen-reader user hears it happened.
 *
 * Comments are set quieter than the code. The code scrolls inside its box
 * and never widens the page. */
export function CodeBlock({ code, language, copy: words }: { code: string; language: string; copy: Copy }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(code);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    setState(ok ? 'copied' : 'failed');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  }

  return (
    <div className="codebox">
      <div className="cb-h">
        <span className="label">{language}</span>
        <button type="button" className="copy" onClick={copy} data-state={state === 'idle' ? undefined : state}>
          {words[state]}
        </button>
      </div>
      <pre className="cb">
        <code>
          {code.split(/(\/\*.*?\*\/)/).map((part, i) =>
            part.startsWith('/*') ? (
              <span className="k" key={i}>
                {part}
              </span>
            ) : (
              part
            ),
          )}
        </code>
      </pre>
      <span className="sr-only" role="status" aria-live="polite">
        {state === 'copied' ? words.saidCopied : state === 'failed' ? words.saidFailed : ''}
      </span>
    </div>
  );
}
