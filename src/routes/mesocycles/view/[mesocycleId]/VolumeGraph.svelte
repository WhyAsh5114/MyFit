<script lang="ts">
  import Chart from "chart.js/auto";
  import { onMount } from "svelte";
  import { getTotalVolume } from "$lib/util/ProgressiveOverload";
  export let mesocycleTemplate: MesocycleTemplate;
  export let workouts: (Workout | null)[];

  Chart.defaults.color = "#f4f4f4";
  workouts.reverse();

  const chartColors = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#000000", // Black
    "#FFFFFF", // White
    "#FFA500", // Orange
    "#800080", // Purple
    "#008080", // Teal
    "#00FF00", // Lime
    "#000080", // Navy
    "#FF00FF" // Fuchsia (or Pink)
  ];

  type DataEntry = Workout & {
    idx: number;
    sets: number;
    volume: number;
  };

  interface Item {
    [key: string]: any;
  }

  function groupByProperty<T extends Item>(
    array: T[],
    property: keyof T
  ): { [key: string]: T[] }[] {
    return array.reduce((acc: { [key: string]: T[] }[], item: T) => {
      const key = item[property] as unknown as string;
      const group = acc.find((g) => g.hasOwnProperty(key));

      if (group) {
        group[key].push(item);
      } else {
        const newGroup: { [key: string]: T[] } = {};
        newGroup[key] = [item];
        acc.push(newGroup);
      }

      return acc;
    }, []);
  }

  const data: DataEntry[] = [];
  workouts.forEach((workout, idx) => {
    if (workout === null) return;

    const dataEntry: DataEntry = { ...workout, sets: 0, volume: 0, idx };
    workout.exercisesPerformed.forEach((exercise) => {
      dataEntry.sets += exercise.sets.length;
      dataEntry.volume += getTotalVolume(exercise.bodyweight, exercise.sets);
    });
    data.push(dataEntry);
  });

  const groupedData = groupByProperty(data, "dayNumber").toSorted((a, b) => {
    return parseInt(Object.keys(a)[0]) - parseInt(Object.keys(b)[0]);
  });
  let canvasElement: HTMLCanvasElement;
  onMount(() => {
    new Chart(canvasElement, {
      type: "line",
      data: {
        labels: data.map(({ startTimestamp }) =>
          new Date(startTimestamp).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit"
          })
        ),
        datasets: groupedData.map((groupedWorkouts, idx) => {
          const dayNumber = parseInt(Object.keys(groupedWorkouts)[0]);
          return {
            type: "line",
            label: mesocycleTemplate.exerciseSplit[dayNumber]?.name,
            data: data.map((workout) => {
              if (workout.dayNumber === dayNumber) return workout.volume;
              else return null;
            }),
            backgroundColor: chartColors[idx],
            borderColor: "#00000",
            borderWidth: 1
          };
        })
      },
      options: { maintainAspectRatio: false, spanGaps: true }
    });
  });
</script>

<canvas bind:this={canvasElement} class="max-h-96 overflow-x-auto w-96" />
