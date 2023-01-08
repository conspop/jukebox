import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./styles/app.css";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Jukebox",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-800">
        {/* <nav>
          <ul className="grid grid-cols-2 border-b-2">
            <li className="flex">
              <NavLink
                className={"w-full h-full p-8 text-center"}
                to="/library"
              >
                Library
              </NavLink>
            </li>
            <li className="flex">
              <NavLink className="w-full h-full p-8 text-center" to="/add">
                Add
              </NavLink>
            </li>
          </ul>
        </nav> */}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
