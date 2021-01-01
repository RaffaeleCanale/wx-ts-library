export function seconds(s: number): number {
    return s * 1000;
}

export function minutes(m: number): number {
    return m * seconds(60);
}

export function hours(h: number): number {
    return h * minutes(60);
}

export function days(d: number): number {
    return d * hours(24);
}
