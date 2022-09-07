import type { IronSessionOptions } from "iron-session";
import { withIronSessionSsr } from "iron-session/next";
import assert from "assert";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

assert(process.env.SESSION_PASSWORD);

declare module "iron-session" {
  interface IronSessionData {
    token: string;
  }
}

const sessionOptions: IronSessionOptions = {
  cookieName: "csrf-session",
  password: process.env.SESSION_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
>(
  handler: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
  return withIronSessionSsr(handler, sessionOptions);
}
