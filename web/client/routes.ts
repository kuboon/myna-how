/**
 * Every URL the site answers, in one place.
 *
 * `server/router.tsx` maps these to the pages that answer them, and everything that links reads
 * `routes.inside.href()` rather than rebuilding `${base}/inside` at each call site.
 *
 * The map is built with the deploy prefix as its base, so hrefs are correct under a GitHub Pages
 * repo sub-path or a PR preview URL without anyone prepending anything.
 */

import { get, route } from "@remix-run/fetch-router/routes";

import { base } from "./base.ts";

export const routes = route(base, {
  home: get("/"),
  inside: get("/inside"),
  tamper: get("/tamper"),
  phone: get("/phone"),
  auth: get("/auth"),
  anonymous: get("/anonymous"),
  digitalAuthApp: get("/digital-auth-app"),
});
