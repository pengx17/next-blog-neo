import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchLinkMeta } from "../../app/lib/fetch-link-meta";

// See https://vercel.com/docs/serverless-functions/introduction
export default async function linkPreviewHandler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { url } = req.query;
  try {
    const response = await fetchLinkMeta(url as string);
    res.json(response);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
