import { withSessionRoute } from "@lib/withSession";

export default withSessionRoute(async (req, res) => {
  req.session.destroy();

  res.json({ ok: true });
});
