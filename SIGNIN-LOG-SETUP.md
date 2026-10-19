# Owner-only access and the sign-in log

## What protects the app
- **Allowed emails (client-side gate).** Set `allowedEmails` in `config.js`, or the GitHub variable
  `VITE_ALLOWED_EMAILS` (comma-separated), to your Gmail address. If anyone else signs in, the app revokes their
  token at once, signs them out, shows "This app is private — ask contact@qentrotech.com for access", and never
  calls Drive or Calendar.
- **This gate runs in the browser, so it is a deterrent, not a lock.** Google OAuth is the real enforcement:
  - In **Testing** mode, only the test users you list in Google Cloud can consent at all. That is the strictest option.
  - Once the app is **In production** (published or verified), *any* Google account can consent. Then the
    allowed-emails gate plus this sign-in log are your controls.
- **Your own data is never reachable by others either way.** Each person who signs in can only reach their
  *own* Google Drive and Calendar (`drive.file` covers only files the app created in that person's Drive).
  Nothing of yours is exposed to another account.

## Sign-in log (Google Sheet in your Drive)
Other people's browsers can't write to your Drive, so the log goes through a small Apps Script that runs as you.

1. Go to https://script.google.com → **New project**. Name it "Qentro BizOps Sign-in Log".
2. Delete the sample code and paste the contents of **`signin-log.gs`**.
3. Change `TOKEN` at the top to a long random string, for example 32+ letters and digits.
4. Choose the function **`setup`** and click **Run**. Approve the permissions (it's your own script).
   This creates the Sheet **"Qentro BizOps Sign-in Log"** in your Drive.
5. Click **Deploy → New deployment → ⚙ Select type → Web app**:
   - Description: `sign-in log`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL** (`https://script.google.com/macros/s/…/exec`).
6. Put the URL and token into the app:
   - **GitHub Actions build (primary):** Repo → Settings → Secrets and variables → Actions → Variables:
     `VITE_SIGNIN_LOG_URL` = the URL and `VITE_SIGNIN_LOG_TOKEN` = the same token. Then re-run the deploy.
   - **Upload zip:** edit `config.js` → `signInLogUrl: '…/exec'`, `signInLogToken: '…'`.
7. Sign in to the app. A row appears with these columns: Timestamp (America/Denver), Email, Name, Result
   (allowed / blocked), Device / browser, App version, Site.

**How it's sent.** The app sends one `text/plain` POST per sign-in (no CORS preflight; the response isn't read).
If the log is down, sign-in still works and nothing breaks.

**What the script does with input.**
- It checks the token and caps the request at 4 KB.
- It validates the email address and accepts only `allowed` or `blocked` as the result.
- It strips control characters and caps each field's length.
- It prefixes text starting with `= + - @` with `'` so nothing runs as a spreadsheet formula.
- It serialises writes with a lock.

**Download as Excel.** Open the Sheet → **File → Download → Microsoft Excel (.xlsx)**.

**Changing the script later.** Use Deploy → **Manage deployments** → ✎ → Version: *New version*. The URL stays the same.

The privacy policy (privacy.html, section 3b) tells users that sign-in attempts are logged.
