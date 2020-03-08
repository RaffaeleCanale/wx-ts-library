export function parsePathParams(pathDefinition: string, actualPath: string): { [param: string]: string } | null {
    const defSplit = pathDefinition.split('/');
    const actualSplit = actualPath.split('/');

    if (defSplit.length !== actualSplit.length) {
        return null;
    }

    const params: { [param: string]: string } = {};
    for (let i = 0; i < defSplit.length; i += 1) {
        const definition = defSplit[i];
        const actual = actualSplit[i];

        if (definition.startsWith(':')) {
            const paramName = definition.substr(1);
            const paramValue = actual;

            params[paramName] = paramValue;
        } else if (definition !== actual) {
            return null;
        }
    }

    return params;
}

export function foo(): void {}
