export const otaKeys = {
	all: ['ota'] as const,

	currentBundle: () => [...otaKeys.all, 'currentBundle'] as const
};
