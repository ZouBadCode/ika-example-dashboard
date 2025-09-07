import { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';

interface CodeBlockProps {
  code: string;
  lang?: string; // highlight.js language key
  small?: boolean;
}

export function CodeBlock({ code, lang = 'typescript', small }: CodeBlockProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      hljs.highlightElement(ref.current);
    }
  }, [code, lang]);

  return (
    <pre className={`rounded-md bg-muted/50 p-3 overflow-x-auto ${small ? 'text-[11px]' : 'text-xs'}`}>
      <code ref={ref} className={`language-${lang}`}>{code}</code>
    </pre>
  );
}
