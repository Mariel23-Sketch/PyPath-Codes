# PyPath – React frontend

React 19 + Vite + React Router. This is the migrated version of the original `PyPath Students` and
`PyPath Admin` HTML/CSS/JS sites (those folders are kept untouched next to this one for reference).

Everything runs on **sample data** saved in the browser (localStorage). There is no backend yet.

## Run it

```powershell
cd Front-end/pypath-app
npm.cmd install        # first time only (use npm on macOS/Linux)
npm.cmd run dev        # http://localhost:5173
npm.cmd run build      # production build into dist/
npm.cmd run lint
```

Demo logins: student – any username and password. Admin – `admin` / `admin123`.

## Routes

| Portal | Routes |
| --- | --- |
| Start page | `/` |
| Student | `/student/login`, `/student/home`, `/student/learning[/course/:id \| /module/:id \| /lecture/:id]`, `/student/activities[?tab=exercises]`, `/student/activities/quiz/:id`, `/result/:id`, `/exercise/:id`, `/student/announcements`, `/student/rewards[/rewards \| /earn \| /history]`, `/student/profile[/security \| /appearance]` |
| Admin | `/admin/login`, `/admin/dashboard`, `/admin/users[/:id]`, `/admin/learning[/course/:id \| /lessons \| /videos \| /lesson/:id \| /video/:id]`, `/admin/activities[/new \| /:id/edit \| /:id/results]`, `/admin/progress`, `/admin/rewards`, `/admin/announcements`, `/admin/profile`, `/admin/student/points-reward[/rewards \| /earn \| /history]` |

Route separation only organises the UI. It is **not security**; real authentication and authorization
must be enforced by the backend.

## Structure

```
src/
  components/   shared UI (Shell = sidebar/top bar/drawer, Icon, Img, Modal, Dialogs, Toast, Pager, LineChart...)
  layouts/      StudentRoot / AdminRoot (load each portal's CSS), StudentLayout, AdminLayout, StudentPreviewLayout
  pages/        student/ and admin/ screens
  hooks/        useStyles, useTheme, useToast, useDialogs, usePageSearch, ...
  services/     data access: studentStore, studentCatalog, adminDb, adminExtrasStore, pointsStore, session, theme, apiClient
  data/         mock data (studentData, adminSeed, adminUsers, adminDashboard, adminExtras)
  styles/       the original CSS files, copied unchanged (student/ and admin/)
public/assets/img/   logos and mascot pictures
```

Each portal's CSS is injected only while that portal is on screen (`hooks/useStyles.js`), because the two
original sites define the same class names, `:root` variables and `body` rules.

## Connecting a backend later

Pages never read mock data directly; they go through `src/services/*`. To connect an API, copy
`.env.example` to `.env.local`, set `VITE_API_BASE_URL`, and replace the service functions with calls to
`src/services/apiClient.js`. Points, quiz grading and redemptions are only checked in the browser today and
must be validated on the server.
