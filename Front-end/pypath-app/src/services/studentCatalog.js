/* Read-only student catalogue lookups (courses, modules, lectures, activities...).
   Pages call these instead of importing mock data directly, so swapping in a real API later
   only changes this file. Functions that depend on the student's progress take the student state `s`. */
import { DATA } from '../data/studentData';

export const D = DATA;

export const find = {
  course: (id) => D.courses.find((x) => x.id === +id),
  module: (id) => D.modules.find((x) => x.id === +id),
  lecture: (id) => D.lectures.find((x) => x.id === +id),
  quiz: (id) => D.quizzes.find((x) => x.id === +id),
  exercise: (id) => D.exercises.find((x) => x.id === +id)
};

export const lecturesOf = (moduleId) => D.lectures.filter((l) => l.moduleId === moduleId);
export const courseLectures = (courseId) => D.lectures.filter((l) => find.module(l.moduleId).courseId === courseId);
export const modulesOf = (courseId) => D.modules.filter((m) => m.courseId === courseId);
export const quizzesOf = (moduleId) => D.quizzes.filter((q) => q.moduleId === moduleId);
export const exercisesOf = (moduleId) => D.exercises.filter((x) => x.moduleId === moduleId);
export const openLectures = () => D.lectures.filter((l) => find.module(l.moduleId).open);

export function courseProgress(courseId, s) {
  const ls = courseLectures(courseId);
  const done = ls.filter((l) => s.done.includes(l.id)).length;
  return { done, total: ls.length, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 };
}

export function moduleStatus(m, s) {
  if (!m.open) return 'Coming soon';
  const ls = lecturesOf(m.id);
  const d = ls.filter((l) => s.done.includes(l.id)).length;
  return ls.length && d === ls.length ? 'Completed' : d ? 'In progress' : 'Not started';
}

export const nextLecture = (s) => D.lectures.find((l) => find.module(l.moduleId).open && !s.done.includes(l.id));
