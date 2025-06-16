/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import * as React from "react";
import { FormattedMessage, IntlProvider } from "react-intl";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import css from "~/styles/app.css?url";
import { getLocale, getMessages } from "~/lang/config";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import { ModalProvider } from "~/components/Modal";

dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Seoul");

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "IGM 출석부",
        description: `IGM 세계경영연구원 `,
      },
    ],
    links: [
      { rel: "stylesheet", href: css },
      { rel: "icon", href: "/favicon.ico" },
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
          <ModalProvider>
            <div className="navbar shadow-sm bg-base-100 sticky top-0 z-50">
              <Link to="/" className="btn btn-ghost text-xl">
                <FormattedMessage id="title" />
              </Link>
            </div>
            {children}
          </ModalProvider>
          <Scripts />
        </IntlProvider>
      </body>
    </html>
  );
}
