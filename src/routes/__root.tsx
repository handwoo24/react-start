/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import css from "~/styles/app.css?url";
import { seo } from "~/utils/seo";
import { getLocale, getMessages } from "~/lang/config";
import { ModalProvider } from "~/components/Modal";
import { ToastProvider } from "~/components/Toast";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: "stylesheet", href: css },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      {
        src: "https://twemoji.maxcdn.com/v/latest/twemoji.min.js",
        type: "text/javascript",
        crossOrigin: "anonymous",
        async: true,
      },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: React.PropsWithChildren) {
  const locale = getLocale(navigator.language);

  return (
    <html lang={navigator.language}>
      <head>
        <HeadContent />
      </head>
      <body>
        <IntlProvider locale={locale} messages={getMessages(locale)}>
          <ToastProvider>
            <ModalProvider>
              <div className="p-2 flex gap-2 text-lg">
                <Link
                  to="/"
                  activeProps={{
                    className: "font-bold",
                  }}
                  activeOptions={{ exact: true }}
                >
                  Home
                </Link>{" "}
                <Link
                  to="/posts"
                  activeProps={{
                    className: "font-bold",
                  }}
                >
                  Posts
                </Link>{" "}
                <Link
                  to="/users"
                  activeProps={{
                    className: "font-bold",
                  }}
                >
                  Users
                </Link>{" "}
                <Link
                  to="/deferred"
                  activeProps={{
                    className: "font-bold",
                  }}
                >
                  Deferred
                </Link>{" "}
                <Link
                  // @ts-expect-error
                  to="/this-route-does-not-exist"
                  activeProps={{
                    className: "font-bold",
                  }}
                >
                  This Route Does Not Exist
                </Link>
              </div>
              <hr />
              {children}
              <TanStackRouterDevtools position="bottom-right" />
            </ModalProvider>
          </ToastProvider>
        </IntlProvider>
        <Scripts />
      </body>
    </html>
  );
}
