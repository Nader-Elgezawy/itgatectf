

## Fix: 404 on Page Refresh

### Problem
When refreshing the browser on any route (e.g., `/login`, `/dashboard`, `/challenges`), the server returns a 404 error. This happens because the server tries to find an actual file matching the URL path, but this is a Single Page Application (SPA) where all routes are handled by React Router in the browser.

### Solution
Add a `public/_redirects` file that tells the hosting server to serve `index.html` for all routes, letting React Router handle the routing on the client side.

### Changes

**1. Create `public/_redirects`**
Add a single rewrite rule:
```
/*    /index.html   200
```

This tells the server: "For any URL path, serve `index.html` with a 200 status code." React Router will then take over and render the correct page.

This is a one-file, one-line fix.
