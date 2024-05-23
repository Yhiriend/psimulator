<template>
  <section class="main-wrapper">
    <div class="content-report">
      <span><i @click="closeReport" class="bi bi-x"></i></span>
      <h2 style="margin-top: 20px">Procesos expulsivos</h2>
      <div class="table-preemptive">
        <table class="table">
          <thead class="table-dark">
            <tr>
              <th>P</th>
              <th>T.L</th>
              <th>R</th>
              <th>P.R</th>
              <th>T.R</th>
              <th>T.F</th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="(process, index) in processesPreemptive"
              :key="index"
            >
              <tr>
                <td>{{ process.name }}</td>
                <td>{{ process.tl }}</td>
                <td>{{ process.r }}</td>
                <td>{{ process.pr }}</td>
                <td>{{ process.tr }}</td>
                <td>{{ process.tf }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <h2>Procesos no expulsivos</h2>
      <div class="table-nonpreemptive">
        <table class="table">
          <thead class="table-dark">
            <tr>
              <th>P</th>
              <th>T.L</th>
              <th>R</th>
              <th>P.R</th>
              <th>T.R</th>
              <th>T.F</th>
            </tr>
          </thead>
          <tbody>
            <template
              v-for="(process, index) in processesNonpreemptive"
              :key="index"
            >
              <tr>
                <td>{{ process.name }}</td>
                <td>{{ process.tl }}</td>
                <td>{{ process.r }}</td>
                <td>{{ process.pr }}</td>
                <td>{{ process.tr }}</td>
                <td>{{ process.tf }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <ChartComponent :processes="processes" class="chart" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { defineProps, watch, ref, defineEmits } from "vue";
import ChartComponent from "./ChartComponent.vue";
import Process from "../models/process.model";
const props = defineProps<{
  processesPreemptive: Process[];
  processesNonpreemptive: Process[];
  processes: any[];
}>();
const emit = defineEmits(["onCloseReport"]);
watch(props, (_) => {
  console.log("proceses", props.processesPreemptive);
});
const closeReport = () => {
  emit("onCloseReport");
};
</script>
<style scoped>
.main-wrapper {
  height: 150%;
  min-height: max-content;
  max-height: max-content;
  width: 100%;
  top: 0;
  left: 0;
  position: absolute;
  background: rgba(0, 0, 0, 0.438);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
  overflow-y: auto;
}
.content-report {
  position: relative;
  border-radius: 20px;
  height: 80%;
  width: 80%;
  background: white;
  max-height: fit-content;
}
span {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 2em;
  cursor: pointer;
}
.chart {
  z-index: 6;
  width: 100%;
}
</style>
