// Qentro BizOps — runtime settings (optional; edit on GitHub, no rebuild needed).
// Any value left empty falls back to the build-time GitHub Actions variable (VITE_GOOGLE_CLIENT_ID,
// VITE_ALLOWED_EMAILS, VITE_SIGNIN_LOG_URL, VITE_SIGNIN_LOG_TOKEN). Opening index.html by double-click is always local mode.
window.QENTRO_CONFIG = {
  // Google OAuth client ID, e.g. '1234567890-abc.apps.googleusercontent.com'
  googleClientId: '',
  // Owner-only access: the Google accounts allowed to use the app, e.g. ['you@gmail.com']. Empty = anyone.
  allowedEmails: [],
  // Sign-in tracker: the Apps Script web-app URL (https://script.google.com/macros/s/…/exec) — see SIGNIN-LOG-SETUP.md
  signInLogUrl: '',
  // Shared token that must match TOKEN in signin-log.gs (reduces spam)
  signInLogToken: '',
};
