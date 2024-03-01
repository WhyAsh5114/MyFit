<script lang="ts">
  import { Switch } from "$lib/components/ui/switch";
  import { Button } from "$lib/components/ui/button";
  import { Textarea } from "$lib/components/ui/textarea";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as Form from "$lib/components/ui/form";
  import * as Select from "$lib/components/ui/select";
  import { superForm, defaults } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";
  import { exerciseTemplateFormSchema } from "./schemas";
  import { Input } from "$lib/components/ui/input";
  import { muscleGroups, setTypes } from "$lib/types/arrays";

  export let addExercise: (exerciseTemplate: ExerciseTemplate) => void;
  export let editingExercise: (ExerciseTemplate & { idx: number }) | null;

  let exerciseDrawerOpen = false;

  const form = superForm(defaults(zod(exerciseTemplateFormSchema)), {
    SPA: true,
    validators: zod(exerciseTemplateFormSchema),
    onUpdate: ({ form }) => {
      if (form.valid) {
        addExercise(form.data);
        exerciseDrawerOpen = false;
      } else validateForm({ update: true });
    },
    invalidateAll: false,
    id: "exercise-split-exercise-template-form"
  });
  const { form: formData, enhance, validateForm } = form;

  $: mode = editingExercise ? "Edit" : "Add";
  $: exerciseDrawerOpen = editingExercise ? true : false;
  $: if (editingExercise) {
    $formData = editingExercise;
  } else {
    form.reset();
  }

  $: selectedMuscleGroup = $formData.targetMuscleGroup
    ? {
        label: $formData.targetMuscleGroup,
        value: $formData.targetMuscleGroup
      }
    : undefined;
  $: selectedSetType = $formData.setType
    ? {
        label: $formData.setType,
        value: $formData.setType
      }
    : undefined;
</script>

<Drawer.Root bind:open={exerciseDrawerOpen} dismissible={false}>
  <Drawer.Trigger class="w-full">
    <Button
      variant="secondary"
      class="w-full"
      on:click={() => {
        editingExercise = null;
        exerciseDrawerOpen = true;
      }}
    >
      Add exercise
    </Button>
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>{mode} exercise</Drawer.Title>
    </Drawer.Header>
    <form on:submit|preventDefault method="POST" use:enhance class="gap-2">
      <div class="grid grid-cols-2 gap-2 max-h-[30rem] overflow-y-auto px-4">
        <Form.Field {form} name="exerciseName" class="col-span-2">
          <Form.Control let:attrs>
            <Form.Label>Exercise name</Form.Label>
            <Input {...attrs} placeholder="Type here" bind:value={$formData.exerciseName} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="targetMuscleGroup">
          <Form.Control let:attrs>
            <Form.Label>Target muscle group</Form.Label>
            <Select.Root
              selected={selectedMuscleGroup}
              onSelectedChange={(v) => {
                v && ($formData.targetMuscleGroup = v.value);
              }}
            >
              <Select.Trigger {...attrs}>
                <Select.Value placeholder="Select one" />
              </Select.Trigger>
              <Select.Content class="h-48 overflow-y-auto">
                {#each muscleGroups as muscleGroup}
                  <Select.Item value={muscleGroup} label={muscleGroup} />
                {/each}
              </Select.Content>
            </Select.Root>
            <input hidden bind:value={$formData.targetMuscleGroup} name={attrs.name} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="involvesBodyweight">
          <Form.Control let:attrs>
            <Form.Label>Involves bodyweight</Form.Label>
            <div class="border rounded-md py-1.5 px-2 flex items-center">
              <Switch includeInput {...attrs} bind:checked={$formData.involvesBodyweight} />
            </div>
          </Form.Control>
        </Form.Field>
        <Form.Field {form} name="sets">
          <Form.Control let:attrs>
            <Form.Label>Sets</Form.Label>
            <Input {...attrs} placeholder="Type here" bind:value={$formData.sets} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="setType">
          <Form.Control let:attrs>
            <Form.Label>Set type</Form.Label>
            <Select.Root
              selected={selectedSetType}
              onSelectedChange={(v) => {
                v && ($formData.setType = v.value);
              }}
              required
            >
              <Select.Trigger {...attrs}>
                <Select.Value class="capitalize" placeholder="Choose" />
              </Select.Trigger>
              <Select.Content>
                {#each setTypes as setType}
                  <Select.Item class="capitalize" value={setType} label={setType} />
                {/each}
              </Select.Content>
            </Select.Root>
            <input hidden bind:value={$formData.setType} name={attrs.name} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="repRangeStart">
          <Form.Control let:attrs>
            <Form.Label>Rep range start</Form.Label>
            <Input {...attrs} placeholder="Type here" bind:value={$formData.repRangeStart} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="repRangeEnd">
          <Form.Control let:attrs>
            <Form.Label>Rep range end</Form.Label>
            <Input {...attrs} placeholder="Type here" bind:value={$formData.repRangeEnd} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="note" class="col-span-2">
          <Form.Control let:attrs>
            <Form.Label>Bio</Form.Label>
            <Textarea
              {...attrs}
              placeholder="Exercise cues, machine heights, etc."
              class="resize-none"
              bind:value={$formData.note}
            />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </div>
      <div class="grid grid-cols-2 gap-2 p-4">
        <Button type="button" variant="destructive" on:click={() => (exerciseDrawerOpen = false)}>
          Close
        </Button>
        <Form.Button class="w-full">{mode} exercise</Form.Button>
      </div>
    </form>
  </Drawer.Content>
</Drawer.Root>
