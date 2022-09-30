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
