// // // eslint-disable-next-line import/no-extraneous-dependencies
// import { ApiError, Method, Request, Route, Routes } from '@canale/server';
// import { z } from 'zod';
// import { ProtocolSocketHandler } from '../ProtocolSocket';

// type dict = { [name: string]: string };

// // export interface ApiMessage {
// //     path: string;
// //     method: 'get' | 'post' | 'put' | 'patch' | 'delete';
// //     body: any;
// //     query: dict;
// //     headers: dict;
// // }

// const ApiMessage = z.object({
//     path: z.string(),
//     method: z.union([
//         z.literal('get'),
//         z.literal('post'),
//         z.literal('put'),
//         z.literal('patch'),
//         z.literal('delete'),
//     ]),
//     body: z.unknown(),
//     query: z.record(z.array(z.string())),
//     headers: z.record(z.string()),
// });

// function parsePathParams(
//     pathDefinition: string,
//     actualPath: string,
// ): dict | null {
//     const defSplit = pathDefinition.split('/');
//     const actualSplit = actualPath.split('/');

//     if (defSplit.length !== actualSplit.length) {
//         return null;
//     }

//     const params: dict = {};
//     for (let i = 0; i < defSplit.length; i += 1) {
//         const definition = defSplit[i];
//         const actual = actualSplit[i];

//         if (definition.startsWith(':')) {
//             const paramName = definition.substr(1);
//             const paramValue = actual;

//             params[paramName] = paramValue;
//         } else if (definition !== actual) {
//             return null;
//         }
//     }

//     return params;
// }

// export default class SocketApiHandler implements ProtocolSocketHandler {
//     constructor(private readonly routes: Routes) {}

//     async fulfillRequest(messageObj: unknown): Promise<unknown> {
//         const { path, method, body, headers, query } =
//             ApiMessage.parse(messageObj);

//         // const { path, method, body, headers, query } =
//         //     this.validateMessage(message);

//         const { route, params } = this.findRouteFor(path, method);

//         const request = new Request(body, query, params, headers);

//         // const middlewares = [
//         //     ...this.middlewares,
//         //     ...route.middlewares,
//         //     ...endpoint.middlewares,
//         // ];
//         // for (let i = 0; i < middlewares.length; i += 1) {
//         //     const middleware = middlewares[i];
//         //     await middleware(request);
//         // }

//         const response = await route(request);

//         // TODO Unwrap?
//         return response;
//     }

//     onMessage(message: unknown): void {
//         void this.fulfillRequest(message);
//     }

//     private findRouteFor(
//         path: string,
//         method: Method,
//     ): { route: Route; params: Record<string, string> } {
//         const routeEntries = Object.entries(this.routes);

//         for (const [pathDefinition, routeHandlers] of routeEntries) {
//             const params = parsePathParams(pathDefinition, path);

//             if (params) {
//                 const route = routeHandlers[method];
//                 if (route) {
//                     return { route, params };
//                 }
//             }
//         }

//         throw new ApiError.NotFound('Route not found');
//     }
// }
