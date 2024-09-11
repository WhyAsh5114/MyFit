<script lang="ts">
	import type { RouterOutputs } from '$lib/trpc/router';

	type PropsType = { entityCounts?: Promise<RouterOutputs['users']['getEntityCounts']> };
	let { entityCounts }: PropsType = $props();

	let taskList: string[] = $state([]);

  function getTaskListWithCompletion() {
    
  }
</script>

{#await entityCounts}
	TODO: skeletons
{:then entityCounts}
	{#if entityCounts}
		<p>
			1: login<br />
			2: create exercise Split<br />
			3: create mesocycle<br />
			4: start mesocycle if not active<br />
			5: create workout<br />
			6: done!<br />
		</p>
	{:else}
		<p>
			1: login<br />
			2: create exercise Split<br />
			3: create mesocycle<br />
			4: start mesocycle if not active<br />
			5: create workout<br />
			6: done!<br />
		</p>
	{/if}
{/await}
