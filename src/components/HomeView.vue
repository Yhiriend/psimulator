<!-- eslint-disable prettier/prettier -->
<template>
  <h1 style="margin-top: 40px">Simulador de procesos (RR)</h1>
  <section style="display: flex; padding: 10px 50px">
    <div class="form-wrapper">
      <div class="group-input">
        <label for="quantumInput">QUANTUM</label>
        <input
            id="quantumInput"
            placeholder="Cantidad de quantum"
            type="number"
            v-model="quantumInput"
            min="1"
            :disabled="isDisable"
        />
      </div>
      <div style="width: 20px"></div>
      <div class="group-input">
        <label for="thInput">TH (ms)</label>
        <input
            id="thInput"
            placeholder="Tiempo del hilo (ms)"
            type="number"
            v-model="thInput"
            min="1"
            :disabled="isDisable"
        />
      </div>

      <div class="group-input">
        <label for="catalogInput">Catalog</label>
        <select :disabled="isDisable" id="catalogInput" v-model="selectorRef">
          <option value="" disabled selected>Escoge un catalogo</option>
          <template
            v-for="(option, index) in catalogSelectorOptions"
            :key="index"
          >
            <option :value="option.id">{{ option.name }}</option>
          </template>
        </select>
      </div>
    </div>
  </section>
  <div class="simulator-wrapper" style="padding-bottom: 20px">
    <SimulatorComponent
      :processes="processes ?? []"
      :quantum="quantumInput ?? 1"
      :th="thInput ?? 1"
      :inputsfilled="inputsfilled"
      @simulation-is-running="isRunning"
    />
  </div>
</template>
<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import SimulatorComponent from "./SimulatorComponent.vue";

import { getRandomColor, users } from "@/utils/utils";
import { onMounted, ref, watch, defineModel } from "vue";
import { fetchCatalogues } from "@/services/api.service";

const catalogSelectorOptions: any = ref([]);
const selectorRef = ref();
const processes = ref<any[]>();
const quantumInput = ref<number>(1);
const thInput = ref<number>(1);
const colors = ref([]);
const inputsfilled = ref(false);
const isDisable = ref(false);

const isRunning = (value: boolean) => {
  if (value){
    isDisable.value = true;
  } else {
    isDisable.value = false;
  }
};
const getBurstTime = (word: string, threadTime: number) => {
  //if (word.includes(" ")) {
  //  return word.split(" ").join("").length * threadTime;
  //}
  return word.length * threadTime;
};

const getProcesses = () => {
  return catalogSelectorOptions.value
    .find((c: any) => c.id === selectorRef.value)
    .processes.map((p: any, index: number) => {
      return {
        ...p,
        r: p.description.length,
        tr: getBurstTime(p.description, thInput.value ?? 1),
        timesExecuted: 0,
        timeArrive: index,
        currentTime: 0,
        tf: 0,
        color: getRandomColor(colors.value),
        quantum: 0,
        systemProcess: users.includes(p.user),
      };
    });
};

const getCatalogues = async () => {
  return await fetchCatalogues();
};

onMounted(async () => {
  catalogSelectorOptions.value = await getCatalogues();
});

const updateInputs = () => {
  if (thInput.value && quantumInput.value){
    inputsfilled.value = true;
  }else {
    inputsfilled.value = false;
  }
}

watch(selectorRef, (_) => {
  processes.value = getProcesses();
  console.log("processes selected", processes.value);
  updateInputs();
});
watch(quantumInput, (_) => {
  updateInputs();
});
watch(thInput, (_) => {
  updateInputs();
});
</script>

<style scoped>
.chart {
  width: 100%;
}

.form-wrapper {
  height: fit-content;
  width: fit-content;
  padding: 30px;
  border-radius: 20px;
  background: rgb(255, 255, 255);
  box-shadow: 10px 10px 20px 1px rgba(0, 0, 0, 0.11);
  display: flex;
  justify-content: space-evenly;
}

.group-input {
  display: flex;
  flex-direction: column;
  margin: 20px;
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
</style>
