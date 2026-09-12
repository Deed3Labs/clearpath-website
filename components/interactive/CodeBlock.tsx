'use client';

import { useEffect, useRef, useState } from 'react';

/* A code sample with a copy button.
 *
 * The guide's own rule is "a box is for something you interact with", and
 * this is exactly that: a block whose whole purpose is to be taken away. So it
 * gets a ground, a border and a header carrying the language and the action.
 *
 * Copy prefers the async Clipboard API and falls back to a hidden textarea and
 * execCommand where that API is unavailable (an http origin, an embedded
 * webview), because a copy button that silently does nothing is worse than
 * none. The result is announced, so a screen-reader user hears it happened.
 */
export function CodeBlock({ code, language = 'CSS' }: { code: string; language?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

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
    <div className="sg-codebox">
      <div className="sg-codebox-head">
        <span className="sg-codebox-lang">{language}</span>
        <button type="button" className="sg-copy" onClick={copy} data-state={state}>
          {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}
        </button>
      </div>
      <pre className="sg-code">
        <code>{code}</code>
      </pre>
      <span className="sr-only" role="status" aria-live="polite">
        {state === 'copied' ? 'Code copied to clipboard' : state === 'failed' ? 'Copy failed' : ''}
      </span>
    </div>
  );
}
