# App navigation flows

User states are Unknown, Known, and Authenticated. Until authentication is implemented, all users resolve to Unknown, regardless of cookies.

## Startup routing

The PWA’s stable start URL is `/`. The server redirects `/` and `/Default.html` without displaying a Default page:

- Unknown users redirect to `/about.html`.
- Known and Authenticated users redirect to `/home.html`.

Startup redirects are not cached. Offline startup serves cached About; authenticated status requires online authorization. All users can access About directly. Direct navigation to About or Home stays on that page.

The following install, authentication, and roster flows are planned.

## Unregistered unknown users

About explains the app’s benefits and shows PWA install/upgrade prompts when needed. A "More Info" link opens device-specific instructions and an introduction to PWAs. This page could also serve as the install page.

## Registered or previously seen users

Home offers login/signup, with wording that assumes users recognized by a cookie have already seen About. It may link back to About for users who want more information.

## Main location-aware app

After authentication on Home, users reach the roster of people looking to connect, with switchable map and list views.

## Flow summary

Startup routing:

```text
/ or /Default.html
  +-> [Unknown]                -> /about.html
  +-> [Known or Authenticated] -> /home.html
```

Planned install and authentication flows:

```text
/about -> /install -> /home -> [authenticate online] -> /roster
/about -> /home -> [authenticate online] -> /roster
/home -> [authenticate online] -> /roster
/home -> /about
```
