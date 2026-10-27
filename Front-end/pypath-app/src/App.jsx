import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { DialogProvider } from './components/Dialogs';
import StudentRoot from './layouts/StudentRoot';
import StudentLayout from './layouts/StudentLayout';
import AdminRoot from './layouts/AdminRoot';
import AdminLayout from './layouts/AdminLayout';
import StudentPreviewLayout from './layouts/StudentPreviewLayout';
import Launcher from './pages/Launcher';

const StudentLogin = lazy(() => import('./pages/student/Login'));
const StudentHome = lazy(() => import('./pages/student/Home'));
const StudentLearning = lazy(() => import('./pages/student/Learning'));
const StudentActivities = lazy(() => import('./pages/student/Activities'));
const StudentAnnouncements = lazy(() => import('./pages/student/Announcements'));
const StudentRewards = lazy(() => import('./pages/student/Rewards'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));

const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminLearning = lazy(() => import('./pages/admin/LearningMaterials'));
const AdminActivities = lazy(() => import('./pages/admin/Activities'));
const AdminProgress = lazy(() => import('./pages/admin/extras/Progress'));
const AdminRewards = lazy(() => import('./pages/admin/extras/Rewards'));
const AdminAnnouncements = lazy(() => import('./pages/admin/extras/Announcements'));
const AdminProfile = lazy(() => import('./pages/admin/extras/AdminProfile'));
const AdminPointsReward = lazy(() => import('./pages/admin/PointsReward'));

/* Route map. The student and admin portals have separate layouts and stylesheets.
   NOTE: these routes only organise the UI. They are not security – real authentication and
   authorization must be enforced by the backend when it exists. */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <DialogProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Launcher />} />

              <Route path="/student" element={<StudentRoot />}>
                <Route index element={<Navigate to="login" replace />} />
                <Route path="login" element={<StudentLogin />} />
                <Route element={<StudentLayout />}>
                  <Route path="home" element={<StudentHome />} />
                  <Route path="learning/*" element={<StudentLearning />} />
                  <Route path="activities/*" element={<StudentActivities />} />
                  <Route path="announcements" element={<StudentAnnouncements />} />
                  <Route path="rewards/:tab?" element={<StudentRewards />} />
                  <Route path="profile/:tab?" element={<StudentProfile />} />
                </Route>
              </Route>

              <Route path="/admin" element={<AdminRoot />}>
                <Route index element={<Navigate to="login" replace />} />
                <Route path="login" element={<AdminLogin />} />
                <Route element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users/*" element={<AdminUsers />} />
                  <Route path="learning/*" element={<AdminLearning />} />
                  <Route path="activities/*" element={<AdminActivities />} />
                  <Route path="quizzes" element={<Navigate to="/admin/activities" replace />} />
                  <Route path="progress" element={<AdminProgress />} />
                  <Route path="rewards" element={<AdminRewards />} />
                  <Route path="announcements" element={<AdminAnnouncements />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>
                <Route element={<StudentPreviewLayout />}>
                  <Route path="student/points-reward/:tab?" element={<AdminPointsReward />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </DialogProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
