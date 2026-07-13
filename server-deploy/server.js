"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const http_1 = require("http");
const port = parseInt(process.env.PORT || "3000", 10);
const dev = false;
const app = (0, next_1.default)({ dev });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const expressApp = (0, express_1.default)();
    expressApp.use("/static", express_1.default.static(".next/static"));
    expressApp.use(express_1.default.static("public"));
    expressApp.use((req, res) => {
        return handle(req, res);
    });
    const httpServer = (0, http_1.createServer)(expressApp);
    httpServer.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});
//# sourceMappingURL=server.js.map