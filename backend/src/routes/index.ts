import { Router } from "express";
import fs from "fs";
import path from "path";

const apiRouter = Router();

function loadRoutes(dirPath: string, prefix = "") {
    if (!fs.existsSync(dirPath)) return;

    fs.readdirSync(dirPath).forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            loadRoutes(fullPath, `${prefix}/${file}`);
        } else if ((file.endsWith(".route.ts") || file.endsWith(".route.js")) && file !== "index.ts") {
            const routeName = file.split(".")[0];
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const route = require(fullPath).default;
            apiRouter.use(`${prefix}/${routeName}`, route);
        }
    });
}

loadRoutes(__dirname);

export default apiRouter;
