import express from "express";
import next from "next";
import { createServer } from "http";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();

  expressApp.use("/static", express.static(".next/static"));
  expressApp.use(express.static("public"));

  expressApp.use((req, res) => {
    return handle(req, res);
  });

  const httpServer = createServer(expressApp);
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
