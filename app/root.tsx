import type {MetaFunction} from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwind from '~/stylesheets/tailwind.css';

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Editions GPT",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gradient-to-br from-[#191919] via-[#191919] to-[#643C99] text-white font-body leading-6 bg-fixed">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function links() {
  return [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: 'true',
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
    },
    {
      rel: "stylesheet",
      href: tailwind,
    },
  ];
}
