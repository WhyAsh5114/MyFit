import { useMutation } from '#lib/features/data/mutation.svelte.js';
import { getDb } from '#lib/clients/idb-client.js';
import type { CalendarDate } from '@internationalized/date';
import type { NewRow } from '@myfit/shared/client';
import { activityEntryKeys } from '../keys';
import { invalidateKeys } from '#lib/features/data/dependencies.js';
import { toast } from 'svelte-sonner';
import { m } from '#lib/paraglide/messages.js';

export const useUpsertDynamicActivityData = () =>
	useMutation({
		mutationFn: async ({
			date,
			...data
		}: Omit<NewRow<'ActivityEntry'>, 'id'> & { date: CalendarDate }) => {
			const { orm } = await getDb();
			// One row per account and day, so devices that sync later converge instead of each creating
			// their own. The id is the table's primary key across all accounts, hence the userId.
			const id = `generated-activity:${data.userId}:${date.toString()}`;
			return await orm.activityEntry.upsert({
				where: { id },
				update: data,
				create: { ...data, id }
			});
		},

		onSuccess: (data) => invalidateKeys(activityEntryKeys.byUser(data.userId)),

		onError: (error) => {
			toast.error(m['unknownErrorOccurred']());
			console.error('Failed to create activity entry:', error);
		}
	});
