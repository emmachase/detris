"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = exports.range = void 0;
function* range(n) {
    for (let i = 0; i < n; i++) {
        yield i;
    }
    return n;
}
exports.range = range;
function shuffle(array) {
    const len = array.length;
    for (let i = 0; i < len; i++) {
        const which = Math.floor(Math.random() * (i + 1) % len);
        [array[i], array[which]] = [array[which], array[i]];
    }
    return array;
}
exports.shuffle = shuffle;
