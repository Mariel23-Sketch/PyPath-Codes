/* Sample user accounts for the admin "Manage Users" screen (mock data, ported from the old page).
   FRONTEND DEMO ONLY – replace with an API call when the backend exists. */
export const USER_COURSES = ['Python Basics', 'Python Data Structures', 'Object-Oriented Python', 'Python Problem Solving'];

export const INITIAL_USERS = [
  ['Jasmine Santos', 'jasmine@gmail.com', 'Student', 'Active', '2025-05-18', 1250],
  ['Marco Rivera', 'marco@sample.com', 'Student', 'Active', '2025-05-17', 420],
  ['Lian Cruz', 'lian@domain.com', 'Student', 'Active', '2025-05-16', 2480],
  ['Aira Delgado', 'aira@test.com', 'Student', 'Active', '2025-05-16', 980],
  ['Noah Reyes', 'noah@sample.com', 'Admin', 'Inactive', '2025-05-15', 0],
  ['Kayla Mendoza', 'kayla@mail.com', 'Student', 'Active', '2025-05-12', 560],
  ['Paolo Garcia', 'paolo@mail.com', 'Student', 'Active', '2025-05-10', 1900],
  ['Trisha Lim', 'trisha@mail.com', 'Student', 'Inactive', '2025-05-08', 330],
  ['Miguel Torres', 'miguel@mail.com', 'Student', 'Active', '2025-05-06', 740],
  ['Sofia Ramos', 'sofia@pypath.com', 'Admin', 'Active', '2025-05-03', 0],
  ['Gab Navarro', 'gab@mail.com', 'Student', 'Active', '2025-05-02', 1120],
  ['Bea Castillo', 'bea@mail.com', 'Student', 'Active', '2025-04-29', 610]
].map((u, i) => ({ id: i + 1, name: u[0], email: u[1], role: u[2], status: u[3], joined: u[4], points: u[5] }));
