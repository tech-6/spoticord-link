import { withDiscordRoute } from "@lib/withSession";
import * as database from "@lib/database";

export default withDiscordRoute(async (req, res) => {
  try {
    await database.deleteAccount(req.user.id, "spotify");

    res.json({ ok: true });
  } catch (ex) {
    res.json({ error: "Internal server error" });
  }
});
