import { Link } from 'react-router-dom';
import Icon from '../../../components/Icon';
import Img from '../../../components/Img';
import { BASE } from './helpers';

export function CourseTile({ c, small = false }) {
  return (
    <span className={`ctile ${c.tone}${small ? ' sm' : ''}`}>
      {c.icon === 'python' ? <Img file="logo-icon.png" label="Logo" /> : <Icon name={c.icon} />}
    </span>
  );
}

/* Breadcrumb: items are [label, to?]; the last one (or any without a link) is the current page */
export function Crumbs({ items }) {
  const all = [['Learning Materials', BASE], ...items];
  return (
    <nav className="crumbs" id="crumbs" aria-label="Breadcrumb">
      {all.map((c, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <span className="sep">›</span>}
          {i === all.length - 1 || !c[1] ? <span className="cur" aria-current="page">{c[0]}</span> : <Link to={c[1]}>{c[0]}</Link>}
        </span>
      ))}
    </nav>
  );
}
