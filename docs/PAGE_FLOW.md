# App pages and user navigation page flow

User states are Unknown, Known, and Authenticated. Until authentication is implemented, all users resolve to Unknown, regardless of cookies.

## '/default.html' login page

The '/default.html' page is the domain's default page. The PWA’s stable start URL is '/'. The default page '/default.html' is the same as '/'. This is the page the user is on when not logged into the app.  The default page contains the login form.  It may also link to the about page.

- Authenticated users redirect to '/home.html' from '/default.html'.
- All other users remain on '/default.html'.

## '/home.html' logged-in landing page

The '/home.html' page is the authenticated user's home page. Newly authenticated or already logged-in users can be redirected from the default page to the home page.  The home page will be everything an authenticated user's needs, includes links to various other pages like: change profile, men online, log out, etc.

## '/about.html' is the app's instructional page

The '/about.html' page can serve as the app's introductory instructional page.  It contains info about **Link-up**, about PWAs, and space permitting - device specific info.

## '/search.html' is the app's profile search page

The '/search.html' page is the app's profile search page, which is also known as a roster of profiles, or currently online profiles.  This will likely be the most used page so its features are more dynamic.

## Example page navigation flows

- User is unauthenticated or not logged-in.
> /default.html -> [authenticate via login form] -> /home.html

- User is already logged-in and starts on '/'
> /default.html -> ["server-side" redirect] -> /home.html
