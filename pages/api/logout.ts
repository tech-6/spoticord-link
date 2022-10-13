import { getClient, Routes } from "@lib/discord";
import { withSessionRoute } from "@lib/withSession";
import * as database from "@lib/database";

export default withSessionRoute(async (req, res) => {
  if (req.session.user_id) {
    // Try to revoke the token

    try {
      const token = await database.getUserDiscordToken(req.session.user_id);

      const params = new URLSearchParams();
      params.set("token", token);

      const client = getClient();
      await client.post(Routes.oauth2TokenRevocation(), {
        auth: false,
        body: params,
        passThroughBody: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch {}
  }

  req.session.destroy();

  res.json({ ok: true });
});
