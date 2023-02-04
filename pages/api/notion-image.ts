import * as https from "https";
import { NextApiHandler } from "next";
import { getBlock } from "../../app/lib/notion-data";

const IMMUTABLE = "public, max-age=31536000, immutable";

const getNotionImage: NextApiHandler = async (req, res) => {
  const { id, last_edited_time } = req.query as Record<string, string>;
  console.log("Image request handler", "meta:", {
    id,
    last_edited_time,
  });

  const block = await getBlock(id);

  if (!block || block.type !== "image") {
    res.status(404);
    res.end();
    console.log("Image request handler", "not supported block", block);
    return;
  }

  const url =
    block.image.type === "file"
      ? block.image.file.url
      : block.image.external.url;

  https.get(url, (getResponse) => {
    const proxyHeader = (header: string) => {
      const value =
        getResponse.headers[header] ||
        getResponse.headers[header.toLowerCase()];
      if (value) {
        res.setHeader(header, value);
      }
    };

    proxyHeader("Content-Type");
    proxyHeader("Content-Length");

    if (getResponse.statusCode === 200) {
      if (last_edited_time) {
        res.setHeader("Cache-Control", IMMUTABLE);
      }
      res.writeHead(200, "OK");
    } else {
      res.status(getResponse.statusCode || 500);
    }

    getResponse
      .pipe(res)
      .on("end", () => {
        res.end();
      })
      .on("error", (err) => {
        console.log("Pipe error", err);
        res.writeHead(500, err.toString());
        res.end();
      });
  });
};

export default getNotionImage;
