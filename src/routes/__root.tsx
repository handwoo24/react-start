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
import { FormattedMessage, IntlProvider } from "react-intl";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import css from "~/styles/app.css?url";
import { seo } from "~/utils/seo";
import { getLocale, getMessages } from "~/lang/config";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/ko";
import dayjs from "dayjs";

dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
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
        src: "/customScript.js",
        type: "text/javascript",
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
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <IntlProvider locale={locale} messages={getMessages(locale)}>
          <div className="navbar shadow-sm bg-base-100 sticky top-0 z-50">
            <Link to="/" className="btn btn-ghost text-xl">
              <FormattedMessage id="title" />
            </Link>
          </div>
          {children}
          <TanStackRouterDevtools position="bottom-right" />
          <Scripts />
        </IntlProvider>
      </body>
    </html>
  );
}
