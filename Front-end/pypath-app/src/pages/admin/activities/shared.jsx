import { Link } from 'react-router-dom';
import { Chip } from '../../../components/Chip';
import { BASE } from './helpers';

export const TypeChip = ({ type }) => <Chip kind={type === 'quiz' ? 'purple' : 'blue'}>{type === 'quiz' ? 'Quiz' : 'Exercise'}</Chip>;

export function Crumbs({ items }) {
  const all = [['Activities', BASE], ...items];
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
