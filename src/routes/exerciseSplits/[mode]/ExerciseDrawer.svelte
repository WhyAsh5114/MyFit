<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Drawer from "$lib/components/ui/drawer";
  import { superForm, defaults } from "sveltekit-superforms";
  import { zod } from "sveltekit-superforms/adapters";
  import { exerciseTemplateFormSchema } from "./schemas";

  const form = superForm(defaults(zod(exerciseTemplateFormSchema)), {
    SPA: true,
    validators: zod(exerciseTemplateFormSchema),
    onUpdate: ({ form }) => {
      if (form.valid) {
        // TODO: submitForm
      }
    },
    resetForm: false,
    invalidateAll: false
  });

  const { form: formData, enhance } = form;
</script>

<Drawer.Root>
  <Drawer.Trigger class="w-full">
    <Button class="w-full">Add exercise</Button>
  </Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Add exercise</Drawer.Title>
    </Drawer.Header>
    <Drawer.Footer>
      <Button>Add exercise</Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
