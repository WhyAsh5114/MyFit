<script lang="ts">
  // TODO: implement the disabled ones...
  const options = [
    {
      title: "Start from scratch",
      description: "Create a brand new exercise split from scratch",
      link: "/exerciseSplits/new",
      disabled: false
    },
    {
      title: "Clone old splits",
      description: "Use one of your old splits as a template",
      link: "/exerciseSplits/templates/clone",
      disabled: true
    },
    {
      title: "Use common splits",
      description: "Start from commonly used splits",
      link: "/exerciseSplits/templates/common",
      disabled: false
    }
  ];
</script>

<h2>New exercise split</h2>
{#each options as { title, description, link, disabled }}
  <a class="btn btn-primary mb-1 h-fit py-4" class:btn-disabled={disabled} href={link}>
    <div class="flex flex-col w-full text-left gap-1">
      <span class="text-lg">{title}</span>
      <p class="font-normal">{description}</p>
    </div>
  </a>
{/each}
