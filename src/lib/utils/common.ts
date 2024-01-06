export function range(start: number, stop?: number, step?: number) {
  if (typeof stop == "undefined") {
    stop = start;
    start = 0;
  }
  if (typeof step == "undefined") step = 1;
  if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) return [];

  const result: number[] = [];
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) result.push(i);
  return result;
}
