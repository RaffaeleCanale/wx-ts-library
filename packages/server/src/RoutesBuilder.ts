import RouteBuilder from './RouteBuilder';
import { Route } from './_shared/api';

export default class RoutesBuilder {

    private routes: RouteBuilder[] = [];

    route(path: string): RouteBuilder {
        const route = new RouteBuilder(path);
        this.routes.push(route);
        return route;
    }

    build(): Route[] {
        return this.routes.map((route) => route.build());
    }
}
