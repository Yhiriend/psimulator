<template>
  <div style="padding: 50px">
    <canvas id="chart"></canvas>
  </div>
</template>

<script setup lang="ts">
import Chart from "chart.js/auto";
import { onMounted, onBeforeUnmount, ref, defineProps } from "vue";
const props = defineProps<{ processes: any[] }>();
const chartInstance = ref<Chart | null>(null);

//const labels = ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"];
const labels = ref();

onMounted(() => {
  console.log("procesos", props.processes);
  labels.value = props.processes?.map((p) => {
    return p.name;
  });
  const datasets = [
    {
      label: "Proceso vs T.R",
      data: props.processes?.map((p) => {
        return Number(p.tr);
      }),
      borderWidth: 1,
    },
  ];
  const data = {
    labels: labels.value,
    datasets,
  };
  const config = {
    type: "line",
    data: {
      labels: labels.value,
      datasets: datasets,
    },
    options: {},
  };

  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
  const ctx = document.getElementById("chart") as HTMLCanvasElement;
  if (ctx) {
    chartInstance.value = new Chart(ctx, config);
  }
});

onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }
});
</script>
