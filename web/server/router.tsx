/**
 * The site, wired by hand.
 *
 * Route definitions live in `client/routes.ts` and this file maps them to the pages that answer
 * them. `router.map(routes, controller)` is the whole of the mapping, and a controller has to name
 * an action for every route in the map it owns: leave one out and the router throws while it is
 * being built, rather than answering a route with nothing.
 *
 * What is exported is a plain `@remix-run/fetch-router` router. The GitHub Pages build
 * (`@remix-kbn/ssg`) crawls it with `fetch()` from `entryPoints`, following links, and writes each
 * response to disk. There is no server API: everything on the site is static.
 */

import {
  createController,
  createRouter,
  type RouterContext,
} from "@remix-run/fetch-router";
import { render } from "@remix-run/render-middleware";
import { createFileTree, githubPages } from "@remix-kbn/ssg/site";
import type { FileServerBehavior } from "@remix-kbn/ssg/site";

import { assets, assetsPath } from "./assets.ts";
import { clientRuntime } from "./runtime.ts";
import { ogImage, ogPaths, serveOgImage } from "./og/mod.ts";
import { base } from "../client/base.ts";
import { Layout, type PageModule } from "../client/layout.tsx";
import type { ChapterKey } from "../client/chapters.ts";
import { routes } from "../client/routes.ts";

import * as Home from "../client/pages/index.tsx";
import * as Inside from "../client/pages/inside.tsx";
import * as Tamper from "../client/pages/tamper.tsx";
import * as Phone from "../client/pages/phone.tsx";
import * as Auth from "../client/pages/auth.tsx";
import * as Anonymous from "../client/pages/anonymous.tsx";
import * as DigitalAuthApp from "../client/pages/digital_auth_app.tsx";

/** Deploy path prefix. The build strips it back off when writing, so output lands at the root. */
export { base };

/** Where the static build deploys. The build writes the file this rule would serve. */
export const fileServer: FileServerBehavior = githubPages();

/**
 * Renders a page module into the shell.
 *
 * The route comes in alongside the module because the page's own path is what its social card is
 * registered under — the card is drawn from the same `title` and `description` the `<head>` gets.
 */
function pageAction(
  route: { href(): string },
  page: PageModule,
  chapter?: ChapterKey,
) {
  const image = ogImage(route.href(), { ...page, chapter });
  const Page = page.default;

  return (context: AppContext): Response =>
    context.render(
      <Layout
        title={page.title}
        description={page.description}
        image={image}
        script={page.hydrate ? clientRuntime : null}
        current={chapter}
        wide={chapter === undefined}
      >
        <Page />
      </Layout>,
    );
}

/** The files under `client/static/`, served verbatim at their own names. */
const staticFiles = await createFileTree({
  rootDir: `${import.meta.dirname}/../client/static`,
  basePath: `${base}/static`,
  cacheControl: "public, max-age=3600",
});

/** `render({ assets })` puts `context.render(node)` on every request. */
const router = createRouter({ middleware: [render({ assets })] });

/** The request context those middlewares produce — `context.render`, in practice. */
export type AppContext = RouterContext<typeof router>;

declare module "@remix-run/fetch-router" {
  interface RouterTypes {
    context: AppContext;
  }
}

const pages = createController(routes, {
  actions: {
    home: pageAction(routes.home, Home),
    inside: pageAction(routes.inside, Inside, "inside"),
    tamper: pageAction(routes.tamper, Tamper, "tamper"),
    phone: pageAction(routes.phone, Phone, "phone"),
    auth: pageAction(routes.auth, Auth, "auth"),
    anonymous: pageAction(routes.anonymous, Anonymous, "anonymous"),
    digitalAuthApp: pageAction(
      routes.digitalAuthApp,
      DigitalAuthApp,
      "digitalAuthApp",
    ),
  },
});

router.map(routes, pages);

router.get(`${base}/static/*path`, ({ request }) => staticFiles.fetch(request));
router.get(`${assetsPath}/*path`, ({ request }) => assets.fetch(request));
router.get(`${base}/og/*path`, ({ request }) => serveOgImage(request));

/**
 * Where the static crawl starts.
 *
 * Pages are reached by following links from `/`. The social cards are the exception: an
 * `og:image` is an absolute URL meant for someone else's server, and nothing links to it.
 */
export const entryPoints: readonly string[] = ["/", ...ogPaths()];

export default router;
