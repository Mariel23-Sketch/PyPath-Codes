/* Plain helpers for the admin Learning Materials screens. */
export const BASE = '/admin/learning';
export const TONE_FOR = { python: 'c-blue', layers: 'c-green', cube: 'c-orange', code: 'c-purple' };

export const courseLessons = (lessons, cid) => lessons.filter((l) => l.courseId === cid).sort((a, b) => a.order - b.order);
export const courseActs = (acts, cid) => acts.filter((a) => a.courseId === cid);
export const lessonActs = (acts, lid) => acts.filter((a) => a.lessonId === lid);
/* give a course's lessons the order 1..n (returns a new lessons array) */
export const renumber = (lessons, cid) => {
  const order = courseLessons(lessons, cid).map((l, i) => [l.id, i + 1]);
  return lessons.map((l) => { const o = order.find((x) => x[0] === l.id); return o ? { ...l, order: o[1] } : l; });
};
export const uniqueTitle = (list, title, selfId, pred) => !list.some((x) => x.id !== selfId && pred(x) && x.title.trim().toLowerCase() === title.toLowerCase());

