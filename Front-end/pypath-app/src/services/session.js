/* "Signed in" flags kept in sessionStorage, exactly like the old pages did.
   FRONTEND DEMO ONLY – this is not security. Real authentication and authorization must be
   enforced by the backend once it exists (the login pages then call the API and store its token). */
const KEYS = { student: 'pypath_student_in', admin: 'pypath_admin' };
const REMEMBER = { student: 'pypath_student_user', admin: 'pypath_admin_user' };

export const session = {
  signIn(portal) { try { sessionStorage.setItem(KEYS[portal], '1'); } catch { /* ignore */ } },
  signOut(portal) { try { sessionStorage.removeItem(KEYS[portal]); } catch { /* ignore */ } },
  rememberedUser(portal) { try { return localStorage.getItem(REMEMBER[portal]) || ''; } catch { return ''; } },
  remember(portal, name) {
    try {
      if (name) localStorage.setItem(REMEMBER[portal], name); else localStorage.removeItem(REMEMBER[portal]);
    } catch { /* ignore */ }
  }
};
