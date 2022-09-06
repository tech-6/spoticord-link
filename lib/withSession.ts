import type { IronSessionOptions } from "iron-session";
import { withIronSessionSsr } from "iron-session/next";
import { randomBytes } from "crypto";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

declare module "iron-session" {
  interface IronSessionData {
    token: string;
  }
}

const sessionOptions: IronSessionOptions = {
  cookieName: "csrf-session",
  password: randomBytes(64).toString("hex"),
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
