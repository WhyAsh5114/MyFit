<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Input } from "$lib/components/ui/input";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import Icon from "@iconify/svelte";
  import { exerciseSplitStore, selectedSplitDayIdx } from "./splitStore";
  import { defaults, superForm } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";
  import { structureTabFormSchema } from "./schemas";
  import { onMount } from "svelte";
  export let currentTab;

  let warningDrawerOpen = false;
  let lostExercisesDays: string[] = [];

  const form = superForm(defaults(zod(structureTabFormSchema)), {
    SPA: true,
    validators: zod(structureTabFormSchema),
    onUpdated: ({ form }) => {
      if (form.valid) submitStructure();
    },
    resetForm: false,
    invalidateAll: false,
    id: "exercise-split-structure-form"
  });
  const { form: formData, enhance, errors } = form;

  onMount(() => {
    $formData.name = $exerciseSplitStore.name;
    $formData.splitDays = $exerciseSplitStore.splitDays.map((splitDay) => splitDay?.name ?? null);
  });

  function addDay() {
    const dayName = $formData.splitDayName || null;
    if (dayName && $formData.splitDays.includes(dayName)) {
      $errors.splitDayName = ["Workout names should be unique"];
      return;
    }
    $formData.splitDays = [...$formData.splitDays, dayName];
    $formData.splitDayName = "";
  }

  function removeDay(idx: number) {
    $formData.splitDays = $formData.splitDays.filter((_, _idx) => _idx !== idx);
  }

  function submitStructure(force = false) {
    const newSplitDays = $formData.splitDays.filter((splitDay) => splitDay !== null) as string[];
    const oldSplitDays = $exerciseSplitStore.splitDays
      .filter((splitDay) => splitDay !== null && splitDay.exerciseTemplates.length > 0)
      .map((splitDay) => splitDay?.name) as string[];

    lostExercisesDays = oldSplitDays.filter((splitDay) => !newSplitDays.includes(splitDay));
    if (lostExercisesDays.length > 0 && !force) {
      warningDrawerOpen = true;
      return;
    }

    $exerciseSplitStore = {
      name: $formData.name,
      splitDays: $formData.splitDays.map((name) => {
        if (name === null) return null;
        return {
          name: name,
          exerciseTemplates:
            $exerciseSplitStore.splitDays.find((splitDay) => splitDay?.name === name)
              ?.exerciseTemplates ?? ([] as ExerciseTemplate[])
        };
      })
    };
    $selectedSplitDayIdx = $exerciseSplitStore.splitDays.findIndex((splitDay) => splitDay !== null);
    currentTab = "exercises";
  }
</script>

<form on:submit|preventDefault method="POST" use:enhance class="p-4 space-y-8 border rounded-md">
  <Form.Field {form} name="name">
    <Form.Control let:attrs>
      <Form.Label>Exercise split name</Form.Label>
      <Input {...attrs} autocomplete="off" placeholder="Type here" bind:value={$formData.name} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="splitDayName">
    <Form.Control let:attrs>
      <Form.Label>Workout days</Form.Label>
      <div class="flex gap-2">
        <Input
          {...attrs}
          placeholder="Day {$formData.splitDays.length + 1} name"
          bind:value={$formData.splitDayName}
        />
        <Button type="button" variant="secondary" on:click={addDay}>
          {#if $formData.splitDayName}
            Add workout
          {:else}
            Add rest day
          {/if}
        </Button>
      </div>
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="splitDays">
    <Form.Control>
      <Form.Label asChild>
        <span class="text-sm font-medium">Microcycle structure</span>
      </Form.Label>
      <div class="flex w-full flex-wrap gap-1">
        {#each $formData.splitDays as splitDay, idx}
          <div class="flex">
            {#if splitDay}
              <Badge class="flex gap-1" variant="secondary">
                <Button variant="ghost" class="p-0 h-fit" on:click={() => removeDay(idx)}>
                  <Icon icon="material-symbols:close" />
                </Button>
                {splitDay}
              </Badge>
            {:else}
              <Badge class="flex gap-1" variant="outline">
                <Button
                  variant="outline"
                  class="p-0 h-fit border-0"
                  on:click={() => removeDay(idx)}
                >
                  <Icon icon="material-symbols:close" />
                </Button>
                Rest
              </Badge>
            {/if}
          </div>
        {:else}
          <Badge variant="outline">Added workout days will be shown here</Badge>
        {/each}
      </div>
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <div class="flex w-full justify-end">
    <Form.Button>Save & Next</Form.Button>
  </div>
</form>

<Drawer.Root open={warningDrawerOpen} onClose={() => (warningDrawerOpen = false)}>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Warning</Drawer.Title>
      <Drawer.Description>
        You will lose created exercise data from the following days:
        <span class="font-semibold">{lostExercisesDays.join(", ")}</span>
      </Drawer.Description>
    </Drawer.Header>
    <Drawer.Footer>
      <Button variant="destructive">Continue</Button>
      <Drawer.Close asChild let:builder>
        <Button variant="outline" builders={[builder]}>Cancel</Button>
      </Drawer.Close>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
