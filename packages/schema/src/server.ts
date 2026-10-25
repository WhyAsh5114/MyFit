import clientContract from './contract.runtime';
import serverContract, {
	type Contract as ServerContract
} from './schema.postgres.generated.runtime';

export type { ServerContract };
export type { Models as ServerModels } from './schema.postgres.generated';

/** The browser and server contracts, for `createSqlSync`: it checks the client's storage hash against the first. */
export { clientContract, serverContract };
