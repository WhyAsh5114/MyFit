<script lang="ts">
	import MyModal from '$lib/components/MyModal.svelte';
	import MuscleGroupComponent from './MuscleGroupComponent.svelte';

	export let volumeOverviewModal: HTMLDialogElement;
</script>

<MyModal
	title="Volume Overview Help"
	titleColor="text-accent"
	bind:dialogElement={volumeOverviewModal}
>
	<div class="carousel w-full">
		<div id="item1" class="carousel-item w-full flex-col gap-2 px-0.5 justify-center">
			<div class="flex flex-col gap-1 bg-base-100 p-4 rounded-lg">
				<MuscleGroupComponent muscleGroup="Glutes" freq={2} volume={8} />
				<div class="flex w-full bg-primary italic rounded-md px-2 py-0.5">
					<h4 class="basis-24 shrink-0">Muscle</h4>
					<p>Volume range <br /> (0 -&gt; MRV)</p>
					<p class="ml-auto justify-self-end">Frequency</p>
				</div>
			</div>
		</div>
		<div id="item2" class="carousel-item w-full flex-col gap-2 px-0.5 justify-center">
			<div class="flex flex-col gap-1 bg-base-100 p-4 rounded-lg">
				<MuscleGroupComponent muscleGroup="Side delts" freq={2} volume={2} />
			</div>
			<div>
				<ul class="list-disc ml-5 mb-2">
					<li>Frequency not within recommended range</li>
					<li>Volume &lt; MV (Maintenance Volume)</li>
				</ul>
				<p class=" italic">Might cause muscle loss</p>
			</div>
		</div>
		<div id="item3" class="carousel-item w-full flex-col gap-2 px-0.5 justify-center">
			<div class="flex flex-col gap-1 bg-base-100 p-4 rounded-lg">
				<MuscleGroupComponent muscleGroup="Side delts" freq={2} volume={6} />
			</div>
			<div>
				<ul class="list-disc ml-5 mb-2">
					<li>Frequency not within recommended range</li>
					<li>Volume &lt; MEV (Minimum Effective Volume)</li>
				</ul>
				<p class=" italic">Might not cause sufficient muscle growth</p>
			</div>
		</div>
		<div id="item4" class="carousel-item w-full flex-col gap-2 px-0.5 justify-center">
			<div class="flex flex-col gap-1 bg-base-100 p-4 rounded-lg">
				<MuscleGroupComponent muscleGroup="Side delts" freq={3} volume={8} />
			</div>
			<div>
				<ul class="list-disc ml-5 mb-2">
					<li>Frequency within recommended range</li>
					<li>Volume &gt;= MEV (Minimum Effective Volume)</li>
				</ul>
				<p class=" italic">Should cause sufficient growth</p>
			</div>
		</div>
		<div id="item5" class="carousel-item w-full flex-col gap-2 px-0.5 justify-center">
			<div class="flex flex-col gap-1 bg-base-100 p-4 rounded-lg">
				<MuscleGroupComponent muscleGroup="Side delts" freq={5} volume={45} />
			</div>
			<div>
				<ul class="list-disc ml-5 mb-2">
					<li>Volume &gt; MRV (Maximum Recoverable Volume)</li>
				</ul>
				<p class=" italic">Too much volume, might interfere with recovery</p>
			</div>
		</div>
		<div id="item6" class="carousel-item w-full flex-col gap-2 px-0.5 justify-center">
			<div class="flex flex-col gap-1 bg-base-100 p-4 rounded-lg">
				<MuscleGroupComponent muscleGroup="Side delts" freq={7} volume={45} />
			</div>
			<div>
				<ul class="list-disc ml-5 mb-2">
					<li>Highly advise against current frequency</li>
				</ul>
				<p class=" italic">No rest days, probably unsustainable</p>
			</div>
		</div>
		<div id="item7" class="carousel-item w-full flex-col gap-2 px-0.5 justify-center">
			<div class="flex flex-col gap-1 bg-base-100 p-4 rounded-lg">
				<MuscleGroupComponent muscleGroup="Front delts" freq={0} volume={0} />
			</div>
			<div>
				<ul class="list-disc ml-5 mb-2">
					<li>Extreme frequency is okay since there is generally overlap from other muscles</li>
				</ul>
				<p class=" italic">
					Front delts are trained enough during pressing movements and will grow with just them
				</p>
			</div>
		</div>
	</div>
	<div class="flex justify-center w-full pt-2 gap-2 mt-2">
		<a href="#item1" class="btn btn-xs">1</a>
		<a href="#item2" class="btn btn-xs">2</a>
		<a href="#item3" class="btn btn-xs">3</a>
		<a href="#item4" class="btn btn-xs">4</a>
		<a href="#item5" class="btn btn-xs">5</a>
		<a href="#item6" class="btn btn-xs">6</a>
		<a href="#item7" class="btn btn-xs">7</a>
	</div>
</MyModal>
