export function areArraysIdentical(arr1: any[], arr2: any[]) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

export function getFormattedDate(timestamp: number) {
    const date = new Date(timestamp);
    let day = date.getDate();
    let month = (date.getMonth() + 1).toString();
    if (Number(month) < 10) {
        month = '0' + month;
    }
    let year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export function truncate(str: string | undefined, n = 17) {
    if (!str) return '';
    return str.length > n ? str.slice(0, n - 1) + '...' : str;
}

export const messages: Record<number, string> = {
    0: 'Why so low?',
    2.5: 'Not bad',
    5: 'Nice sweet spot',
    7.5: 'Good for beginners!',
    10: 'A bit tough huh?',
    12.5: 'Sure about this?',
    15: 'Entering danger zone!',
    17.5: "Don't overdo it!",
    20: "Don't overdo it!",
    22.5: "Don't overdo it!",
    25: 'What!?'
};

export const colors = new Map<number, Array<string>>([
    [0, ['text-white', 'border-white', 'stroke-white', 'fill-white']],
    [2.5, ['text-green-300', 'border-green-300', 'stroke-green-300', 'fill-green-300']],
    [5, ['text-green-400', 'border-green-400', 'stroke-green-400', 'fill-green-400']],
    [7.5, ['text-lime-500', 'border-lime-500', 'stroke-lime-500', 'fill-lime-500']],
    [10, ['text-yellow-400', 'border-yellow-400', 'stroke-yellow-400', 'fill-yellow-400']],
    [12.5, ['text-amber-500', 'border-amber-500', 'stroke-amber-500', 'fill-amber-500']],
    [15, ['text-orange-500', 'border-orange-500', 'stroke-orange-500', 'fill-orange-500']],
    [17.5, ['text-red-500', 'border-red-500', 'stroke-red-500', 'fill-red-500']],
    [20, ['text-red-500', 'border-red-500', 'stroke-red-500', 'fill-red-500']],
    [22.5, ['text-red-500', 'border-red-500', 'stroke-red-500', 'fill-red-500']],
    [25, ['text-red-600', 'border-red-600', 'stroke-red-600', 'fill-red-600']]
]);
