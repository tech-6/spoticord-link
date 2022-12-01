import type { IronSessionOptions } from "iron-session";
import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";
import assert from "assert";
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse,
} from "next";
import * as database from "@lib/database";
import { APIUser, getClient, Routes } from "./discord";

declare module "iron-session" {
  interface IronSessionData {
    csrf_token?: string;
    user_id?: string;
  }
}

const sessionOptions: IronSessionOptions = {
  cookieName: "csrf-session",
  password: process.env.SESSION_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withDiscordRoute<T = any>(
  handler: (
    req: NextApiRequest & { user: APIUser },
    res: NextApiResponse<T>
  ) => unknown | Promise<unknown>
) {
  return withSessionRoute(async (req, res) => {
    if (!req.session.user_id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = await database.getUserDiscordToken(req.session.user_id);

    if (!token) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const client = getClient(token);

    const user = (await client.get(Routes.user())) as APIUser;

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    (req as any).user = user;

    handler(req as any, res);
  });
}

export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
>(
  handler: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
  return withIronSessionSsr(handler, sessionOptions);
}

export function withDiscordSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown }
>(
  handler: (
    user: APIUser,
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
) {
  const login = () => ({
    redirect: { destination: "/login", permanent: false },
  });

  return withSessionSsr((ctx) => {
    if (!ctx.req.session.user_id) {
      // User is not logged in
      return login();
    }

    return database
      .getUserDiscordToken(ctx.req.session.user_id)
      .then((token) => {
        const client = getClient(token);

        return client
          .get(Routes.user())
          .then(
            (user) => {
              const val = handler(user as APIUser, ctx);

              if (val instanceof Promise) {
                // Prevent bubbling up of the promise
                val.catch(() => {});
                return val;
              }

              return val;
            } // User is logged in
          )
          .catch((ex) => {
            // Discord API returned an error, assume the token is invalid
            ctx.req.session.destroy();
            return login();
          });
      })
      .catch((ex: database.APIError) => {
        // On any error, we'll just redirect to the login page.
        ctx.req.session.destroy();
        return login();
      });
  });
}
