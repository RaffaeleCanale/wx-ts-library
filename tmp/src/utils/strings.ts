// eslint-disable-next-line import/prefer-default-export
export function prettyPrint(value: any): string {
    if (Array.isArray(value)) {
        return `[${value.map(prettyPrint).join(', ')}]`;
    }
    return JSON.stringify(value);
}
