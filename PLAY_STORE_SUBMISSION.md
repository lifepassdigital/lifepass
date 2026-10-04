# LIFEPASS — Google Play first submission

## App identity
- App name: LIFEPASS
- Package name: com.lifepass.digital
- Type: App
- Distribution: Free
- Default language: English (United States)
- Target API: 36 (Android 16)

Google Play requires new apps and app updates submitted from August 31, 2026 to target API 36 or higher. The repository CI explicitly enforces API 36 before building the release AAB.

## Repository readiness
- Capacitor Android app is generated in CI.
- Release output is an Android App Bundle (.aab).
- Release signing is isolated to GitHub Actions secrets.
- Google Play publishing is configured in .github/workflows/play-store-release.yml.
- Privacy policy is at privacy.html and linked from the app footer.
- Release notes are at distribution/whatsnew/whatsnew-en-US.

## One-time Play Console setup
1. Create the Play Console app with package name com.lifepass.digital.
2. Complete developer identity/package registration if Play Console requests it.
3. Use Google Play App Signing.
4. Create a Google Play service account with access to publish this app and save its JSON as the GitHub Actions secret GOOGLE_PLAY_SERVICE_ACCOUNT_JSON.
5. Configure the upload/signing key secrets below.
6. Complete Play Console App content declarations: privacy policy, ads, app access, target audience/content, content rating and Data safety.
7. Add the store listing, app icon, screenshots and feature graphic.
8. Start with the internal testing track.

## GitHub Actions secrets
- ANDROID_SIGNING_KEY — base64-encoded Android upload keystore
- ANDROID_SIGNING_ALIAS — upload-key alias
- ANDROID_SIGNING_STORE_PASSWORD — keystore password
- ANDROID_SIGNING_KEY_PASSWORD — key password
- GOOGLE_PLAY_SERVICE_ACCOUNT_JSON — service-account JSON

Never commit private keys, passwords, keystores or service-account JSON.

## Store listing draft

### Short description
Digital product passports that keep product identity, history, verification and value information together.

### Full description
LIFEPASS gives products a digital identity that stays with them.

Create a digital product passport, record product details and ownership information, keep service and document history, request verification, generate QR-accessible public passport information, and review product value insights in one place.

Key features:
- Digital product passports
- Product identity and history
- Verification workflow
- Service and document records
- QR/public passport sharing
- Ownership transfer support
- Marketplace listing support
- Product value analysis
- LIFEPASS AI assistance
- Mobile-friendly experience

LIFEPASS is designed to make a product's story easier to preserve, verify and share.

## Data Safety preparation
The current application uses Supabase Authentication for account sign-in/sign-up and email verification; browser local storage for passport records and other client-side state; browser-managed product document data; Supabase-backed verification requests/status; and a LIFEPASS AI Edge Function when the AI assistant is used.

Before completing Play Console's Data safety form, verify the exact production Supabase policies, Edge Function behavior, retention, third-party AI processing and any future SDK behavior. The declarations must match production behavior.

## Submission checklist

### Ready in repository
- [x] Android package ID
- [x] API 36 target enforcement
- [x] Release AAB build
- [x] Release signing workflow
- [x] Google Play publishing workflow
- [x] Privacy policy page and in-app link
- [x] Release notes
- [x] Store listing draft

### Requires Play Console/account action
- [ ] Create/register the Play app
- [ ] Complete developer verification if prompted
- [ ] Configure Play App Signing/upload key
- [ ] Create and authorize publishing service account
- [ ] Add GitHub Actions secrets
- [ ] Upload screenshots and feature graphic
- [ ] Complete App content/Data safety declarations
- [ ] Run internal testing
- [ ] Submit for review / production rollout

## Privacy-policy note
The policy in privacy.html is based on the current repository implementation. Review it against the live Supabase project, Edge Functions, storage policies and third-party services before publishing it as the legal policy for the app.
