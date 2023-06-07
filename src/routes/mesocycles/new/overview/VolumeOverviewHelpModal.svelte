<script lang="ts">
	import MyModal from '$lib/MyModal.svelte';
	import MuscleGroupComponent from './MuscleGroupComponent.svelte';

	export let volumeOverviewModal: HTMLDialogElement;
</script>

<MyModal
	title="Volume Overview Help"
	titleColor="text-accent"
	bind:dialogElement={volumeOverviewModal}
>
	<div class="carousel w-full">
		<div id="item1" class="carousel-item w-full">
			<div class="flex flex-col gap-2">
				<p>
					The volume overview provides a brief overview of the volume of the exercises and frequency
				</p>
				<div class="flex flex-col gap-1 bg-base-100 p-4 rounded-lg">
					<MuscleGroupComponent muscleGroup="Glutes" freq={2} volume={8} />
					<div class="flex w-full bg-primary italic rounded-md px-2 py-0.5">
						<h4 class="basis-24 shrink-0">Muscle</h4>
						<p>Volume range <br /> (0 -&gt; MRV)</p>
						<p class="ml-auto justify-self-end">Frequency</p>
					</div>
				</div>
			</div>
		</div>
		<div id="item2" class="carousel-item w-full">
			<p />
		</div>
		<div id="item3" class="carousel-item w-full">
			<p />
		</div>
		<div id="item4" class="carousel-item w-full">
			<p />
		</div>
	</div>
	<div class="flex justify-center w-full py-2 gap-2">
		<a href="#item1" class="btn btn-xs">1</a>
		<a href="#item2" class="btn btn-xs">2</a>
		<a href="#item3" class="btn btn-xs">3</a>
		<a href="#item4" class="btn btn-xs">4</a>
	</div>
</MyModal>
