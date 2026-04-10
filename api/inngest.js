import { serve } from "inngest/fetch";
import { inngest, functions } from "../backend/lib/inngest.js";

const handler = serve({
  client: inngest,
  functions,
  serveHost: "https://prep4-place.vercel.app",
});

export default handler;