import { Outlet } from 'react-router-dom';
import css from '../styles/admin/base.css?inline';
import useStyles from '../hooks/useStyles';

/* Loads the admin portal's base stylesheet while any /admin/* page is shown. */
export default function AdminRoot() {
  useStyles(css, 0);
  return <Outlet />;
}
