import { withDiscordRoute } from "@lib/withSession";
import * as database from "@lib/database";

export default withDiscordRoute(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const request = await database.getRequestByUserId(req.user.id);

    if (Date.now() / 1000 > request.expires) {
      await database.deleteRequest(req.user.id);
      throw new Error("expired");
    }

    return res.status(200).json({ token: request.token });
  } catch {}

  const request = await database.createRequest(req.user.id);

  res.status(201).json({ token: request.token });
});
