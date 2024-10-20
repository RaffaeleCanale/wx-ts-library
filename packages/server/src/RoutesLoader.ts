import fs from 'fs';
import path from 'path';
import type { Method, Route, Routes } from './Route.js';

function isValidMethod(method: string): method is Method {
    return ['get', 'post', 'delete', 'put', 'patch'].includes(method);
}

interface File {
    absPath: string;
    basename: string;
    isDirectory: boolean;
}

function readdir(directory: string): File[] {
    return fs.readdirSync(directory).map((file) => ({
        absPath: path.join(directory, file),
        basename: file,
        isDirectory: fs.statSync(path.join(directory, file)).isDirectory(),
    }));
}

export async function importRoutes(
    routesDirectory: string,
    routePathPrefix = '',
): Promise<Routes> {
    const result: Routes = {};

    const promises = readdir(routesDirectory).map(async (file) => {
        if (file.isDirectory) {
            const routes = await importRoutes(
                file.absPath,
                `${routePathPrefix}/${file.basename}`,
            );
            Object.assign(result, routes);
        } else if (file.basename.endsWith('.js')) {
            const routePath =
                file.basename === 'index.js'
                    ? routePathPrefix
                    : `${routePathPrefix}/${file.basename.substring(
                          0,
                          file.basename.length - 3,
                      )}`;

            const modules = (await import(file.absPath)) as Record<
                string,
                Route
            >;

            const routes: Partial<Record<Method, Route>> = {};

            Object.entries(modules).forEach(([name, module]) => {
                const method = name.toLocaleLowerCase();
                if (!isValidMethod(method)) {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `Ignoring invalid method "${method}" in ${file.absPath}`,
                    );
                    return;
                }
                routes[method] = module;
            });

            result[routePath] = routes;
        } else {
            // eslint-disable-next-line no-console
            console.warn(`Unknown file type: ${file.absPath}`);
        }
    });
    await Promise.all(promises);

    return result;
}
