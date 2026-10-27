import { Outlet } from 'react-router-dom';
import css from '../styles/student/base.css?inline';
import useStyles from '../hooks/useStyles';

/* Loads the student portal's base stylesheet while any /student/* page is shown
   (and removes it when you leave, so it can't clash with the admin portal's CSS). */
export default function StudentRoot() {
  useStyles(css, 0);
  return <Outlet />;
}
