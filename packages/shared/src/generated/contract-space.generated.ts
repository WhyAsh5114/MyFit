// THIS FILE IS AUTO-GENERATED — do not edit by hand.
// Regenerate with: prisma-idb migration contract-space

import type { Contract } from './contract';
import { contractSpaceFromJson } from '@prisma/orm-toolchain/migration-tools/spaces';
import contractJson from './contract.json' with { type: 'json' };
import mig_20261021T0544_baseline_meta from '../../migrations/app/20261021T0544_baseline/migration.json' with { type: 'json' };
import mig_20261021T0544_baseline_ops from '../../migrations/app/20261021T0544_baseline/ops.json' with { type: 'json' };
import mig_20261111T1852_add_chats_meta from '../../migrations/app/20261111T1852_add_chats/migration.json' with { type: 'json' };
import mig_20261111T1852_add_chats_ops from '../../migrations/app/20261111T1852_add_chats/ops.json' with { type: 'json' };

export const contractSpace = contractSpaceFromJson<Contract>({
	contractJson,
	migrations: [
		{
			dirName: '20261021T0544_baseline',
			metadata: mig_20261021T0544_baseline_meta,
			ops: mig_20261021T0544_baseline_ops
		},
		{
			dirName: '20261111T1852_add_chats',
			metadata: mig_20261111T1852_add_chats_meta,
			ops: mig_20261111T1852_add_chats_ops
		}
	],
	headRef: {
		hash: mig_20261111T1852_add_chats_meta.to,
		invariants: (mig_20261111T1852_add_chats_meta.providedInvariants ?? []) as readonly string[]
	}
});
