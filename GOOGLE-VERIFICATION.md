# Publishing the Google OAuth app (Qentro BizOps)

Setup: a Gmail (consumer) Google account, user type **External**, publishing status **In production**.
The app asks for one **sensitive** scope (`calendar.events`) and otherwise only non-sensitive scopes.
Until Google approves verification, users see an "unverified app" screen (100-user cap).

## 1. Verify the domain (Search Console + Namecheap TXT)
1. Go to https://search.google.com/search-console → **Add property** → **Domain** → `qentrotech.com`.
2. Copy the TXT record value (`google-site-verification=…`).
3. In Namecheap go to **Domain List → qentrotech.com → Manage → Advanced DNS → Add new record**:
   Type **TXT Record**, Host **@**, Value = the copied string, TTL Automatic → save.
4. Back in Search Console click **Verify**. DNS can take from a few minutes up to a few hours.
   Use the **same Google account** that owns the Cloud project.
5. Also keep the site's CNAME record: Host `bizops` → `xfislearning.github.io`.

## 2. Branding (Google Cloud Console → Google Auth Platform → Branding)
| Field | Value |
|---|---|
| App name | **Qentro BizOps** |
| User support email | contact@qentrotech.com (it must be an address you can select; add it as a Google group or use your Gmail if it isn't offered) |
| App logo | `qentro-bizops-logo-120.png` (120×120, included in this zip) |
| Application home page | https://bizops.qentrotech.com |
| Privacy policy link | https://bizops.qentrotech.com/privacy.html |
| Terms of service link | https://bizops.qentrotech.com/terms.html |
| Authorized domains | `qentrotech.com` |
| Developer contact email | contact@qentrotech.com |

Uploading a logo means the branding must be verified too. That is quick once the domain is verified.

## 3. Clients (Google Auth Platform → Clients → your Web client)
- Authorized JavaScript origins: `https://bizops.qentrotech.com`
- Authorized redirect URIs: `https://bizops.qentrotech.com/` (used by the iPhone home-screen app)

## 4. Data access: declare exactly these scopes
| Scope | Type | Used for |
|---|---|---|
| `openid` | non-sensitive | sign-in |
| `.../auth/userinfo.email` (`email`) | non-sensitive | show which account is connected; login hint on reconnect |
| `.../auth/userinfo.profile` (`profile`) | non-sensitive | name and picture in the app header |
| `https://www.googleapis.com/auth/drive.file` | non-sensitive (recommended) | the app's own folder "Qentro BizOps" and the files it creates |
| `https://www.googleapis.com/auth/calendar.events` | **sensitive** | events the app creates for your meetings and follow-ups |

Calendar is requested **incrementally**. Sign-in asks only for openid, email, profile and drive.file.
`calendar.events` is requested only when the user turns calendar sync on or clicks
**Settings → Connect Google Calendar** (`include_granted_scopes=true`).

## 5. Publish
**Audience → Publish app → Confirm** (status "In production").

## 6. Prepare for verification
**Verification Center → Prepare for verification**. Confirm the branding, then for data access paste the
justification below and the demo video link. Then submit and answer reviewer emails sent to the developer contact.

### Scope justification: `calendar.events`
> Qentro BizOps is a business-operations tool for one consultant. When the user turns on calendar sync
> (it is off until they connect Calendar), the app creates events on the user's primary calendar for
> meetings they schedule in the app (date, time, location, a link back to the app) and for their dated
> follow-ups and tasks (a 15-minute reminder entry). When the user edits or completes the item in the app,
> it updates or deletes that same event. Every event it creates carries a private extended property
> (`qentroApp`). The app lists events only with `privateExtendedProperty=qentroApp=…`, reads an event
> only by an id it created, and never reads, changes or deletes any other event. Nobody is invited and
> no emails are sent (`sendUpdates=none`). Read-only and free/busy scopes cannot create or update events,
> so they cannot deliver this feature. No data is sent to our servers (the app has none) and nothing is
> used for advertising or shared.

**Narrower option.** The app writes only to the user's own **primary** calendar.
Google also offers `calendar.events.owned` ("See, create, change, and delete events on Google calendars
you own"), which is enough for this behavior. If the reviewer asks for least privilege, switch:
1. Set `CAL_SCOPE` in `src/google/auth.ts` to `https://www.googleapis.com/auth/calendar.events.owned`.
2. Declare it instead of `calendar.events`.
3. Update the privacy policy scope line.

`calendar.app.created` would also work, but only if the app moved its events into its own secondary
calendar. That is a behavior change, so it is not used.
`calendar.events.freebusy` / `calendar.freebusy` / `*.readonly` cannot create events, so they are insufficient.

### Note: `drive.file`
`drive.file` is non-sensitive and per-file. The app can only see files it created or that the user opened
with it. It stores `relationships-data.json`, transcripts (Markdown), snapshots and the Excel backup in
the user's "Qentro BizOps" folder (formerly "Qentro Relationships"). No justification is required, but the
video shows it anyway.

## 7. Demo video script (2–3 minutes, unlisted YouTube)
Record the full browser window. Keep the URL bar visible the whole time. Speak or caption in English.

1. **0:00 Intro (10 s).** Show "Qentro BizOps — Business Operations System at https://bizops.qentrotech.com".
2. **0:10 Consent with client ID (35 s).** Open the site in a fresh profile and click **Sign in with Google**.
   On the Google screen, click the URL bar and zoom so `client_id=…apps.googleusercontent.com` is readable.
   Show that the requested access is your name, email and Drive app files. Then choose the account and allow.
3. **0:45 Incremental Calendar consent (25 s).** Go to Settings → Google Calendar → **Connect Google Calendar**.
   Show the consent screen URL (client_id plus `scope=…calendar.events`), then allow.
4. **1:10 Create a meeting and a follow-up (30 s).** Create an event with a date and start time. Open a contact,
   set a next follow-up date, and save. Click the sync pill ("Synced").
5. **1:40 It appears in Google Calendar (20 s).** Open calendar.google.com in a new tab.
   Show the meeting and the 9:00 AM follow-up, then open one and show the "Open in Qentro BizOps" link.
6. **2:00 Edit and delete sync (25 s).** Back in the app, change the meeting time and mark the follow-up done.
   Sync, then refresh Google Calendar: the time has moved and the follow-up event is gone.
7. **2:25 Drive (15 s).** Open drive.google.com → **Qentro BizOps** folder. Show `relationships-data.json`,
   `Transcripts/`, and `Qentro BizOps Backup.xlsx`. Say that the app can only see files it created.
8. **2:40 Privacy (15 s).** Open https://bizops.qentrotech.com/privacy.html. Scroll to the Calendar section
   and the Limited Use statement. Then show Settings → Sign out (the token is revoked).

## Checklist
- [ ] Domain verified in Search Console (TXT at Namecheap)
- [ ] privacy.html and terms.html live at bizops.qentrotech.com and reachable without sign-in
- [ ] Branding filled in, logo uploaded, authorized domain qentrotech.com
- [ ] Client origins and redirect URI set
- [ ] Scopes declared exactly as above
- [ ] App published (In production)
- [ ] Demo video uploaded (unlisted) and link pasted
- [ ] Justification pasted; verification submitted
