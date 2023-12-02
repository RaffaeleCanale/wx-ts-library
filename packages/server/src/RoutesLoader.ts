import fs from 'fs';
import path from 'path';
import type { Method, Route, Routes } from './Route.js';

function isValidMethod(method: string): method is Method {
    return ['get', 'post', 'delete', 'put', 'patch'].includes(method);
}

export function importRoutes(directory: string, prefix = ''): Routes {
    const result: Routes = {};

    fs.readdirSync(directory).forEach((key): void => {
        const file = path.join(directory, key);
        const isDirectory = fs.statSync(file).isDirectory();

        if (isDirectory) {
            const path = `${prefix}/${key}`;
            const routes = importRoutes(file, path);
            Object.assign(result, routes);
        } else if (file.endsWith('.js')) {
            const routeName = key.substring(0, key.length - 3);
            const path = `${prefix}/${routeName}`;

            // eslint-disable-next-line
            const modules = require(file) as Record<string, unknown>;

            const routes: Partial<Record<Method, Route>> = {};

            Object.entries(modules).forEach(([name, module]) => {
                const method = name.toLocaleLowerCase();
                if (!isValidMethod(method)) {
                    console.warn(
                        `Ignoring invalid method "${method}" in ${file}`,
                    );
                    return;
                }
                routes[method] = module as Route;
            });

            result[path] = routes;
        } else {
            console.warn(`Unknown file type: ${file}`);
        }
    });

    return result;
}
