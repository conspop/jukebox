import { createCookieSessionStorage } from "@remix-run/node";

const secret = process.env.SESSION_SECRET;

if (!secret) {
  throw new Error(
    "Please define the SESSION_SECRET environment variable inside .env.local"
  );
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session", // use any name you want here
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [secret],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
