import { withDiscordRoute } from "@lib/withSession";
import * as database from "@lib/database";

export default withDiscordRoute(async (req, res) => {
  // Try to revoke the token

  try {
    const token = await database.getUserDiscordToken(req.user.id);

    await database.revokeDiscordToken(token);
    await database.deleteAccount(req.user.id, "discord");

    req.session.destroy();

    res.json({ success: true });
  } catch (ex) {
    res.status(500).json({ error: "Internal server error" });
  }
});
