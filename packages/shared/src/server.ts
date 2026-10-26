import clientContract from './generated/contract.runtime';
import serverContract, {
	type Contract as ServerContract
} from './generated/postgres-contract.runtime';

export type { ServerContract };
export type { Models as ServerModels } from './generated/postgres-contract';

/** The browser and server contracts, for `createSqlSync`: it checks the client's storage hash against the first. */
export { clientContract, serverContract };
