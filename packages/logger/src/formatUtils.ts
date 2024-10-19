export function prettyPrint(value: unknown): string {
    if (Array.isArray(value)) {
        return `[${value.map(prettyPrint).join(', ')}]`;
    }
    return JSON.stringify(value);
}

export function formatDate(date: Date): string {
    const pad = (num: number): string => {
        const norm = Math.floor(Math.abs(num));
        return (norm < 10 ? '0' : '') + String(norm);
    };
    return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
