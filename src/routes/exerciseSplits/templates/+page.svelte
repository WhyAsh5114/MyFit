<script lang="ts">
  import { emptyExerciseSplitStore, setExerciseSplitStores } from "../[mode]/splitStore";

  const options = [
    {
      title: "Start from scratch",
      description: "Create a brand new exercise split from scratch",
      link: "/exerciseSplits/new",
      onClick: () => {
        setExerciseSplitStores(emptyExerciseSplitStore);
      }
    },
    {
      title: "Clone old splits",
      description: "Use one of your old splits as a template",
      link: "/exerciseSplits/templates/clone"
    },
    {
      title: "Use common splits",
      description: "Start from commonly used splits",
      link: "/exerciseSplits/templates/common"
    }
  ];
</script>

<h2>New exercise split</h2>
{#each options as { title, description, link, onClick }}
  <a class="btn btn-primary mb-1 h-fit py-4" href={link} on:click={onClick}>
    <div class="flex flex-col w-full text-left gap-1">
      <span class="text-lg">{title}</span>
      <p class="font-normal">{description}</p>
    </div>
  </a>
{/each}
