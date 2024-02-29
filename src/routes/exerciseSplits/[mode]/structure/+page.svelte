<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import Icon from "@iconify/svelte";
  import { exerciseSplitStore } from "../splitStore";
  import { page } from "$app/stores";
  import MyModal from "$lib/components/MyModal.svelte";
  import { goto } from "$app/navigation";
  import { defaults, superForm } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";
  import { structureTabFormSchema } from "./schema";

  $: ({ params } = $page);

  const form = superForm(defaults(zod(structureTabFormSchema)), {
    SPA: true,
    validators: zod(structureTabFormSchema),
    onUpdated: ({ form }) => {
      if (form.valid) {
        submitStructure();
      }
    }
  });
  const { form: formData, enhance } = form;

  let deleteSplitDataModal: HTMLDialogElement;
  let notMatchedDays: Set<string> = new Set();

  function addDay() {
    const dayName = $formData.exerciseSplitDayName || null;
    $formData.exerciseSplitDays = [...$formData.exerciseSplitDays, dayName];
    $formData.exerciseSplitDayName = "";
  }

  function removeDay(idx: number) {
    $formData.exerciseSplitDays = $formData.exerciseSplitDays.filter((_, _idx) => _idx !== idx);
  }

  function updateNotMatchedDays() {
    notMatchedDays.clear();
    $exerciseSplitStore.exerciseSplitDays.forEach((splitDay) => {
      if (splitDay?.exerciseSplitDayName) notMatchedDays.add(splitDay.exerciseSplitDayName);
    });
    notMatchedDays = notMatchedDays;
  }

  function createNewExerciseSplit() {
    const newSplitDays: ExerciseSplit["exerciseSplitDays"] = [];
    $exerciseSplitStore.exerciseSplitDays
      .map((splitDay) => splitDay?.exerciseSplitDayName ?? null)
      .forEach((splitDayName) => {
        if (splitDayName === null) {
          newSplitDays.push(null);
        } else {
          const matchingDay = $exerciseSplitStore.exerciseSplitDays.find(
            (splitDay) => splitDay?.exerciseSplitDayName === splitDayName
          );
          if (matchingDay) {
            newSplitDays.push(matchingDay);
            notMatchedDays.delete(matchingDay.exerciseSplitDayName);
          } else {
            newSplitDays.push({ exerciseSplitDayName: splitDayName, exerciseTemplates: [] });
          }
        }
      });
    return newSplitDays;
  }

  async function submitStructure(force = false) {
    updateNotMatchedDays();
    const newSplitDays = createNewExerciseSplit();
    if (notMatchedDays.size > 0 && !force) {
      deleteSplitDataModal.show();
      return;
    }
    $exerciseSplitStore = {
      exerciseSplitName: $formData.exerciseSplitName,
      exerciseSplitDays: $formData.exerciseSplitDays.map((splitDayName) => {
        if (splitDayName === null) return null;
        return { exerciseSplitDayName: splitDayName, exerciseTemplates: [] };
      })
    };
    await goto(`/exerciseSplits/${$page.params.mode}/exercises`);
  }
</script>

<MyModal title="Warning" bind:dialogElement={deleteSplitDataModal}>
  <p>
    You'll lose any exercise data created for the following workout days:
    <span class="font-semibold text-warning">{Array.from(notMatchedDays).join(", ")}</span>
  </p>
  <button class="btn btn-warning btn-block mt-4" on:click={() => submitStructure(true)}>
    Yes, continue
  </button>
</MyModal>

<h2><span class="capitalize">{params.mode}</span> exercise split</h2>

<Tabs.Root class="w-full mt-4 grow flex flex-col">
  <Tabs.List class="w-full grid grid-cols-3">
    <Tabs.Trigger value="structure">Structure</Tabs.Trigger>
    <Tabs.Trigger value="exercises">Exercises</Tabs.Trigger>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="structure">
    <form method="POST" use:enhance class="p-4 space-y-8 border rounded-md">
      <Form.Field {form} name="exerciseSplitName">
        <Form.Control let:attrs>
          <Form.Label>Exercise split name</Form.Label>
          <Input {...attrs} placeholder="Type here" bind:value={$formData.exerciseSplitName} />
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="exerciseSplitDayName">
        <Form.Control let:attrs>
          <Form.Label>Workout days</Form.Label>
          <div class="flex gap-2">
            <Input
              {...attrs}
              placeholder="Day 1 name"
              bind:value={$formData.exerciseSplitDayName}
            />
            <Button type="button" variant="secondary" on:click={addDay}>
              {#if $formData.exerciseSplitDayName}
                Add workout
              {:else}
                Add rest day
              {/if}
            </Button>
          </div>
        </Form.Control>
        <Form.FieldErrors />
      </Form.Field>
      <Form.Field {form} name="exerciseSplitDays">
        <Form.Control>
          <Form.Label asChild>
            <span class="text-sm font-medium">Microcycle structure</span>
          </Form.Label>
          <div class="flex w-full flex-wrap gap-1">
            {#each $formData.exerciseSplitDays as splitDay, idx}
              <div class="flex">
                {#if splitDay}
                  <Badge class="flex gap-1">
                    <Button variant="ghost" class="p-0 h-fit" on:click={() => removeDay(idx)}>
                      <Icon icon="material-symbols:close" />
                    </Button>
                    {splitDay}
                  </Badge>
                {:else}
                  <Badge class="flex gap-1" variant="secondary">
                    <Button variant="ghost" class="p-0 h-fit" on:click={() => removeDay(idx)}>
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
        <Form.Button>Next</Form.Button>
      </div>
    </form>
  </Tabs.Content>
  <Tabs.Content value="exercises" class="flex flex-col grow"></Tabs.Content>
</Tabs.Root>
