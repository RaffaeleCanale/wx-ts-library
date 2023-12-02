import fs from 'fs';
import path from 'path';
import type { Method, Route, Routes } from './Route.js';

function isValidMethod(method: string): method is Method {
    return ['get', 'post', 'delete', 'put', 'patch'].includes(method);
}

export async function importRoutes(
    directory: string,
    prefix = '',
): Promise<Routes> {
    const result: Routes = {};

    const promises = fs.readdirSync(directory).map(async (key) => {
        const file = path.join(directory, key);
        const isDirectory = fs.statSync(file).isDirectory();

        if (isDirectory) {
            const path = `${prefix}/${key}`;
            const routes = await importRoutes(file, path);
            Object.assign(result, routes);
        } else if (file.endsWith('.js')) {
            const routeName = key.substring(0, key.length - 3);
            const path = `${prefix}/${routeName}`;

            const modules = await import(file);

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
    await Promise.all(promises);

    return result;
}
