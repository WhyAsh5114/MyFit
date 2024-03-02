<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import Sun from "lucide-svelte/icons/sun";
  import Moon from "lucide-svelte/icons/moon";
  import { toggleMode, mode } from "mode-watcher";
  import { Chart } from "chart.js";
  import { onMount } from "svelte";

  function updateChartJSColors() {
    const style = getComputedStyle(document.body);
    const foregroundColor = style.getPropertyValue("--foreground").split(" ").join(", ");
    const foregroundMutedColor = style.getPropertyValue("--muted-foreground").split(" ").join(", ");
    Chart.defaults.color = `hsl(${foregroundColor})`;
    Chart.defaults.borderColor = `hsl(0, 0%, ${$mode === 'light' ? '64%' : '32%'})`;
    Chart.defaults.font.weight = 500;
    Chart.defaults.font.size = 13;
  }

  function changeMode() {
    toggleMode();
    updateChartJSColors();
  }

  onMount(() => {
    updateChartJSColors();
  });
</script>

<Button on:click={changeMode} variant="ghost" size="icon">
  <Sun
    class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
  />
  <Moon
    class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
  />
  <span class="sr-only">Toggle theme</span>
</Button>
