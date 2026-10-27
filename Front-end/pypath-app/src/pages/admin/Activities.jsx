import { Navigate, Route, Routes } from 'react-router-dom';
import css from '../../styles/admin/activities.css?inline';
import useStyles from '../../hooks/useStyles';
import ActivityList from './activities/ActivityList';
import ActivityForm from './activities/ActivityForm';
import Results from './activities/Results';
import { BASE } from './activities/helpers';

/* Activities (admin): quizzes and practice exercises.
     /admin/activities              list (?type=quiz|exercise from the sidebar)
     /admin/activities/new          add     /admin/activities/301/edit   edit
     /admin/activities/301/results  sample results */
export default function Activities() {
  useStyles(css);
  return (
    <Routes>
      <Route index element={<ActivityList />} />
      <Route path="new" element={<ActivityForm />} />
      <Route path=":id/edit" element={<ActivityForm />} />
      <Route path=":id/results" element={<Results />} />
      <Route path="*" element={<Navigate to={BASE} replace />} />
    </Routes>
  );
}
