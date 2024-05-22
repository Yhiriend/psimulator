<!-- eslint-disable prettier/prettier -->
<template>
  <div
    class="process"
    :id="processId"
    :style="{ background: process.color ?? '#3D8CC7' }"
    v-if="process"
  >
    <p style="font-size: large; font-weight: bold">
      {{ process.name.slice(0, 11) }}
    </p>
    <p class="pid">
      <span style="color: black; opacity: 0.5">PID</span> {{ process.PID }}
    </p>
    <p class="timearrive">
      <span style="color: black; opacity: 0.5">T.L.</span>
      {{ process.timeArrive ?? 0 }}
    </p>
    <p class="timeended">
      <span style="color: black; opacity: 0.5">T.F.</span> {{ process.tf }}
    </p>
    <p class="timesexe">
      <span style="color: black; opacity: 0.5">Ejecuciones</span>
      {{ process.timesExecuted ?? 0 }}
    </p>
  </div>
</template>
<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { defineProps } from "vue";
import Process from "@/models/process.model";
defineProps<{ process: Process; processId?: string }>();
</script>
<!-- eslint-disable prettier/prettier -->
<style scoped>
.process {
  border: 1px solid rgb(48, 48, 48);
  border-radius: 15px;
  margin-right: 10px;
  padding: 8px 14px;
  transition: opacity 0.3s ease-in-out;
  width: 150px;
  min-width: 150px;
  max-width: 150px;
  min-height: 128px;
  max-height: 128px;
  height: 128px;
  box-sizing: border-box;
}

p {
  margin: 5px 0;
  color: rgb(41, 41, 41);
}

.pid,
.timesexe,
.timeended {
  font-size: 0.8em;
}
</style>
