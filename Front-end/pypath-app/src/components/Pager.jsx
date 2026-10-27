import Icon from './Icon';

/* Pagination widget. Pass onPer to show the "rows per page" select (admin tables). */
export default function Pager({ total, page, per, onPage, onPer }) {
  const pages = Math.max(1, Math.ceil(total / per));
  const cur = Math.min(page, pages);
  return (
    <div className="pager">
      <span className="pager-info">
        {total ? `${(cur - 1) * per + 1}–${Math.min(cur * per, total)} of ${total}` : '0 results'}
      </span>
      <div className="pager-btns">
        <button className="pg" disabled={cur === 1} aria-label="Previous" onClick={() => onPage(cur - 1)}><Icon name="left" /></button>
        {Array.from({ length: pages }, (_, i) => i + 1).map((i) => (
          <button key={i} className={`pg${i === cur ? ' on' : ''}`} onClick={() => onPage(i)}>{i}</button>
        ))}
        <button className="pg" disabled={cur === pages} aria-label="Next" onClick={() => onPage(cur + 1)}><Icon name="right" /></button>
        {onPer && (
          <span className="per-wrap">
            <select className="per" aria-label="Rows per page" value={per} onChange={(e) => onPer(+e.target.value)}>
              {[5, 10, 20].map((n) => <option key={n} value={n}>{n} per page</option>)}
            </select>
          </span>
        )}
      </div>
    </div>
  );
}
