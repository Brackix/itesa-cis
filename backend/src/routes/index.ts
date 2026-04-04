import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const apiRouter = Router();

function loadRoutes(dirPath: string, prefix = '') {
    if (!fs.existsSync(dirPath)) return;

    fs.readdirSync(dirPath).forEach((file) => {
        const fullPath = path.join(dirPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            loadRoutes(fullPath, `${prefix}/${file}`);
            return;
        }

        const isRoute = file.endsWith('.route.ts') || file.endsWith('.route.js');
        const isIndex = file.startsWith('index');
        if (!isRoute || isIndex) return;

        const routeName = file.replace(/\.route\.(ts|js)$/, '');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const route = require(fullPath).default;

        const routePath = `${prefix}/${routeName}`;
        apiRouter.use(routePath, route);
        console.log(`[routes] Loaded: ${routePath}`);
    });
}

loadRoutes(__dirname);

export default apiRouter;