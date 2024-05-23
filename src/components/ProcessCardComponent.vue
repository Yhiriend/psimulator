<!-- eslint-disable prettier/prettier -->
<template>
  <div
    class="process"
    :id="processId"
    :style="{ background: process.color ?? '#3D8CC7' }"
    v-if="process"
  >
    <span class="icon">
      <i class="bi bi-gear-fill" v-if="process.systemProcess"></i>
      <i class="bi bi-person-fill" v-else></i>
    </span>
    <p style="font-size: small; font-weight: bold">
      {{ process.name }}
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
    <p class="timesexe">
      <span style="color: black; opacity: 0.5">Length</span>
      {{ process.name.length }}
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
  position: relative;
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
  overflow: hidden;
}

p {
  margin: 0 0 8px 0;
  color: rgb(41, 41, 41);
  line-height: 0.8;
}

.pid,
.timesexe,
.timeended {
  font-size: 0.8em;
}
.icon {
  position: absolute;
  bottom: -22px;
  left: -12px;
  font-size: 3em;
  color: rgba(0, 0, 0, 0.199);
}
</style>
