import { serve } from "inngest/next";
import { inngest, functions } from "../backend/lib/inngest.js";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});