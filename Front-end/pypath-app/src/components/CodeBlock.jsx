import { esc } from '../lib/text';

/* Python highlighter used by the lesson and activity previews (ported from the old PP.codeBlock).
   The text is HTML-escaped before the highlight <span>s are added. */
function hl(line) {
  let s = esc(line);
  s = s.replace(/(#.*$)/, '<span class="tk-c">$1</span>');
  s = s.replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="tk-s">$1</span>');
  s = s.replace(/\b(for|in|if|else|elif|while|def|return|import|from|break|continue|and|or|not|True|False|None)\b(?![^<]*>)/g, '<span class="tk-k">$1</span>');
  s = s.replace(/\b(print|input|len|range|int|str|float|type|sum)(?=\()/g, '<span class="tk-f">$1</span>');
  return s;
}

export default function CodeBlock({ code }) {
  const rows = String(code || '').replace(/\s+$/, '').split('\n');
  return (
    <div className="editor">
      <div className="editor-bar"><i /><i /><i /></div>
      <div className="code">
        <div className="ln">{rows.map((_, i) => <span key={i}>{i + 1}<br /></span>)}</div>
        <div className="tx" dangerouslySetInnerHTML={{ __html: rows.map(hl).join('\n') }} />
      </div>
    </div>
  );
}
