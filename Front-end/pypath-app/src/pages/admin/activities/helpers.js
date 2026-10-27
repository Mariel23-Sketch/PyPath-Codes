/* Plain helpers for the admin Activities screens. */
export const BASE = '/admin/activities';

/* Where an activity sits: its course and lesson names */
export function whereIs(a, courses, lessons) {
  const c = courses.find((x) => x.id === a.courseId);
  const l = lessons.find((x) => x.id === a.lessonId);
  return { course: c ? c.title : '—', lesson: l ? l.title : 'Whole course' };
}
