<!-- eslint-disable prettier/prettier -->
<template>
  <h1>Simulador de procesos (RR)</h1>
  <section style="display: flex; padding: 10px 50px;">
    <div class="form-wrapper">
      <div class="row">
        <div class="group-input">
          <label for="quantumInput">QUANTUM</label>
          <input id="quantumInput" placeholder="Cantidad de quantum" type="number" v-model="quantumInput" />
        </div>
        <div style="width: 20px"></div>
        <div class="group-input">
          <label for="thInput">TH</label>
          <input id="thInput" placeholder="Tiempo del hilo (ms)" type="number" v-model="thInput" />
        </div>
      </div>

      <div class="group-input">
        <label for="catalogInput">Catalog</label>
        <select id="catalogInput" v-model="selectorRef">
          <option value="" disabled selected>Escoge un catalogo</option>
          <template v-for="(option, index) in catalogSelectorOptions" :key="index">
            <option :value="option.id">{{ option.name }}</option>
          </template>
        </select>
      </div>

    </div>

  </section>
  <div class="simulator-wrapper" style="padding-bottom: 20px;">
    <SimulatorComponent v-model="simulationModel" :processes="processes" :quantum="quantumInput"
      :is-started="isStarted" />
  </div>

</template>
<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import SimulatorComponent from "./SimulatorComponent.vue";
import { PROCESSES as CATALOGUES } from "@/assets/processes";
import { getRandomColor } from "@/utils/utils";
import { onMounted, ref, watch, defineModel } from "vue";

const catalogSelectorOptions: any = ref([]);
const selectorRef = ref();
const processes = ref();
const quantumInput = ref();
const thInput = ref();
const isStarted = ref(false);
const simulationModel: any = defineModel();
const colors = ref([]);

const getBurstTime = (word: string, threadTime: number) => {
  //if (word.includes(" ")) {
  //  return word.split(" ").join("").length * threadTime;
  //}
  return (word.length * threadTime);
}

const getProcesses = () => {
  return catalogSelectorOptions.value.find((c: any) => c.id === selectorRef.value).processes;
}

onMounted(() => {
  catalogSelectorOptions.value = CATALOGUES;
});

watch(selectorRef, (newValue) => {
  catalogSelectorOptions.value = CATALOGUES.map((c: any) => {
    const processesMap = c.processes.map((p: any) => {
      return {
        ...p,
        tr: getBurstTime(p.description, thInput.value ?? 1),
        timesExecuted: 0,
        tf: getBurstTime(p.description, thInput.value ?? 1),
        color: getRandomColor(colors.value)
      }
    });
    c.processes = processesMap;
    return c;
  });
  simulationModel.value = { processReady: getProcesses(), processExecuted: [], processEnded: [] };
});
</script>

<style scoped>
.form-wrapper {
  height: fit-content;
  width: fit-content;
  padding: 30px;
  border-radius: 20px;
  background: rgb(255, 255, 255);
  box-shadow: 10px 10px 20px 1px rgba(0, 0, 0, 0.11);
}

.group-input {
  display: flex;
  flex-direction: column;
}

select {
  border: 1px solid gray;
  border-radius: 15px;
  padding: 5px 8px;
}

label {
  color: rgb(70, 70, 70);
  margin-bottom: 5px;
}

input {
  border: 1px solid gray;
  border-radius: 15px;
  padding: 5px 8px;
}

.row {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 20px;
}
</style>
