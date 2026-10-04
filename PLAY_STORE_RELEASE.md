# LIFEPASS Google Play release setup

Application ID: **com.lifepass.digital**

## Required Play Console setup

Create **LIFEPASS** in Google Play Console with package name `com.lifepass.digital`, then enable Play App Signing.

New Play submissions must target Android 16 / API 36 or higher from August 31, 2026. citeturn0search0turn3search3

## Required GitHub Actions secrets

Repository → Settings → Secrets and variables → Actions:

- `ANDROID_SIGNING_KEY` — base64-encoded upload keystore
- `ANDROID_SIGNING_ALIAS`
- `ANDROID_SIGNING_STORE_PASSWORD`
- `ANDROID_SIGNING_KEY_PASSWORD`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` — complete Google service-account JSON

Never commit the JKS file or passwords.

Create the base64 keystore value with:

```bash
openssl base64 < lifepass-upload-key.jks | tr -d '\n'
```

## Google Play API

Enable the Google Play Android Publisher API, create a service account, and grant it the appropriate app permissions in Play Console. The release workflow consumes its JSON credentials through the GitHub secret. citeturn1search0

## First release

For a new Play app, the package must first exist in Play Console. The upload action documentation recommends creating the app and making the first upload/release before API publishing. citeturn1search0

Run **LIFEPASS Google Play Release** from GitHub Actions with the `internal` track first.

After testing and Play Console requirements are satisfied, run it with `production`.

Release notes live at `distribution/whatsnew/whatsnew-en-US`.
