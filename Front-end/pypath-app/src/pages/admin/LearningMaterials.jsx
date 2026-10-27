import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import css from '../../styles/admin/learning-materials.css?inline';
import useStyles from '../../hooks/useStyles';
import { useToast } from '../../hooks/useToast';
import { useDialogs } from '../../hooks/useDialogs';
import { adminDb } from '../../services/adminDb';
import { nextId, plural } from '../../lib/text';
import { BASE, courseActs, renumber } from './learning/helpers';
import CoursesView from './learning/CoursesView';
import CourseDetail from './learning/CourseDetail';
import CourseForm from './learning/CourseForm';
import MaterialsTable from './learning/MaterialsTable';
import LessonEditor from './learning/LessonEditor';
import VideoEditor from './learning/VideoEditor';

/* Learning Materials (admin). Courses, lessons and videos are stored with services/adminDb and shared
   with the Activities screens.
     /admin/learning                  courses
     /admin/learning/course/1         one course (Lessons / Overview / Students / Settings)
     /admin/learning/lessons|videos   all lessons / all videos tables
     /admin/learning/lesson/101|new   lesson editor      /admin/learning/video/201|new   video editor */
export default function LearningMaterials() {
  useStyles(css);
  const toast = useToast();
  const { confirm } = useDialogs();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [courseForm, setCourseForm] = useState(undefined); // undefined = closed, null = new, course = edit
  const [matCourse, setMatCourse] = useState('');

  const saveCourse = (data) => {
    const courses = adminDb.get('courses');
    if (courseForm) adminDb.set('courses', courses.map((c) => (c.id === courseForm.id ? { ...c, ...data } : c)));
    else adminDb.set('courses', [{ id: nextId(courses), students: 0, avg: 0, ...data }, ...courses]);
    toast(courseForm ? 'Course updated' : 'Course added');
    setCourseForm(undefined);
  };

  const deleteCourse = async (c) => {
    const lessons = adminDb.get('lessons');
    const acts = adminDb.get('activities');
    const nl = lessons.filter((l) => l.courseId === c.id).length;
    const na = courseActs(acts, c.id).length;
    if (!(await confirm({ title: 'Delete this course?', text: `“${c.title}” will be removed together with its ${plural(nl, 'lesson', 'lessons')} and ${plural(na, 'activity', 'activities')}. This cannot be undone.` }))) return;
    const ids = lessons.filter((l) => l.courseId === c.id).map((l) => l.id);
    adminDb.set('lessons', lessons.filter((l) => l.courseId !== c.id));
    adminDb.set('videos', adminDb.get('videos').filter((v) => !ids.includes(v.lessonId)));
    adminDb.set('activities', acts.filter((a) => a.courseId !== c.id));
    adminDb.set('courses', adminDb.get('courses').filter((x) => x.id !== c.id));
    toast('Course deleted');
    if (pathname !== BASE) navigate(BASE);
  };

  const deleteLesson = async (l) => {
    const acts = adminDb.get('activities');
    const videos = adminDb.get('videos');
    const na = acts.filter((a) => a.lessonId === l.id).length;
    const nv = videos.filter((v) => v.lessonId === l.id).length;
    const extra = (na ? ` Its ${plural(na, 'activity', 'activities')} will stay in the course but become unlinked.` : '') + (nv ? ` Its ${plural(nv, 'video', 'videos')} will be removed.` : '');
    if (!(await confirm({ title: `Delete “${l.title}”?`, text: `This lesson will be removed from the course.${extra}` }))) return;
    adminDb.set('activities', acts.map((a) => (a.lessonId === l.id ? { ...a, lessonId: null } : a)));
    adminDb.set('videos', videos.filter((v) => v.lessonId !== l.id));
    adminDb.set('lessons', renumber(adminDb.get('lessons').filter((x) => x.id !== l.id), l.courseId));
    toast('Lesson deleted');
  };

  return (
    <>
      <Routes>
        <Route index element={<CoursesView onAdd={() => setCourseForm(null)} onEdit={setCourseForm} onDelete={deleteCourse} />} />
        <Route path="course/:id" element={<CourseDetail onEdit={setCourseForm} onDeleteCourse={deleteCourse} onDeleteLesson={deleteLesson} />} />
        <Route path="lessons" element={<MaterialsTable tab="lessons" course={matCourse} onCourse={setMatCourse} onDeleteLesson={deleteLesson} />} />
        <Route path="videos" element={<MaterialsTable tab="videos" course={matCourse} onCourse={setMatCourse} onDeleteLesson={deleteLesson} />} />
        <Route path="lesson/:id" element={<LessonEditor />} />
        <Route path="video/:id" element={<VideoEditor />} />
        <Route path="*" element={<Navigate to={BASE} replace />} />
      </Routes>
      {courseForm !== undefined && (
        <CourseForm key={courseForm ? courseForm.id : 'new'} course={courseForm} courses={adminDb.get('courses')} onSave={saveCourse} onClose={() => setCourseForm(undefined)} />
      )}
    </>
  );
}
