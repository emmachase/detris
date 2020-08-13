export function *range(n: number) {
    for (let i = 0; i < n; i++) {
        yield i;
    }

    return n;
}

export function shuffle(array: Array<any>) {
    const len = array.length;
    for (let i = 0; i < len; i++) {
        const which = Math.floor(Math.random()*(i + 1) % len);
        [array[i], array[which]] = [array[which], array[i]];
    }

    return array;
}

export function normalMod(a: number, b: number) {
    return ((a % b) + b) % b;
}

export function capitalize(str: string) {
    return str.charAt(0).toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();
}
