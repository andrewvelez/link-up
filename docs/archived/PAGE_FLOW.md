# App pages and user navigation page flow

Authenticated users are logged in with a known profile.  Unauthenticated users may be able to see who's online without logging in or having a profile, but they cannot message other users.

## Domain root start page - '/' or '/default'

The '/default.html' page is the domain's default page. The PWA’s stable start URL is '/'. The default page '/default.html' is the same as '/'. The default page contains the login form and also a button to go directly to the '/profiles.html' page.

- Authenticated users redirect to '/profiles.html' from '/default.html'.
- Unauthenticated users start on '/default.html', but may click a link to go to '/profiles.html'.

## About Us page - '/about'

The '/about.html' page can serve as the app's introductory instructional page.  It contains info about **Link-up**, about PWAs, and space permitting - device specific info.

## Profiles page - '/profiles'

The page can toggle between a grid/list view of profiles or a map view of profiles.  Map view is becoming increasingly popular so this may be the default.  Particular care must be made not to show specific location while still giving the appearance of showing location.  The profiles page only shows profiles that were given permission to be shown to unauthenticated users.

## Example page navigation flows

- User is unauthenticated or not logged-in.
> /default.html -> [authenticate via login form] -> /home.html

- User is already logged-in and starts on '/'
> /default.html -> ["server-side" redirect] -> /home.html
