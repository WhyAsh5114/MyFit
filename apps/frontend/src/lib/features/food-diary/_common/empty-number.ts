/**
 * The default for a required number field, so its input starts empty instead of at 0. Superforms
 * shows `''` as an empty input, and the schema still rejects it on submit, so the value never
 * reaches saved data. This is the one place the form types are told otherwise.
 */
export const EMPTY_NUMBER = '' as unknown as number;

/** Whether a number field is still empty. */
export const isEmptyNumber = (value: number) => value === EMPTY_NUMBER;
