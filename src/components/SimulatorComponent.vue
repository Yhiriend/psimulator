<template>
  <div>
    <div style="display: flex; justify-content: end; padding-right: 60px">
      <button @click="startSimulation" :disabled="running || !inputsfilled">
        <i
            id="buttons"
            :class="['bi bi-play-circle-fill', { desactive: running || !inputsfilled }]"
        ></i>
      </button>
      <button @click="pauseSimulation" :disabled="!running">
        <i
            id="buttons"
            :class="['bi bi-pause-circle-fill', { desactive: !running }]"
        ></i>
      </button>
      <button @click="stopSimulation" :disabled="!running && !paused">
        <i
            id="buttons"
            :class="['bi bi-stop-circle-fill', { desactive: !running && !paused }]"
        ></i>
      </button>
    </div>
    <p style="font-size: 1em; font-weight: bold; text-align: end; padding-right: 80px">Time: {{ timeCount }}</p>
    <!-- Lista de procesos -->
    <section class="simulator-wrapper">
      <section class="process-ready-wrapper">
        <div class="text-ready"><h3>Listo</h3></div>
        <section class="processes-ready">
          <div class="process-empty">
            <ProcessCardComponent
              :class="{ 'animation-pause': !running }"
              id="process-ready-to-execute"
              :process="processReadyToExecute"
              v-if="processReadyToExecute"
            ></ProcessCardComponent>
          </div>
          <div
            class="processes-wrapper"
            :class="{ 'animation-pause': !running }"
          >
            <template v-for="(process, index) in processList" :key="index">
              <ProcessCardComponent
                :process="process"
                :process-id="index.toString()"
              ></ProcessCardComponent>
            </template>
          </div>
        </section>
      </section>
      <section
        class="execution-wrapper"
        style="
          display: flex;
          align-items: center;
          width: 100%;
          height: fit-content;
        "
      >
        <section class="process-execution-wrapper" style="position: relative">
          <div class="text-execution" style="position: relative">
            <h3 style="text-align: start; padding-left: 40px">En ejecucion</h3>
          </div>
          <div class="quantum-counter">
            <p style="color: gray">Quantum</p>
            <h4 style="color: gray">{{ quantumCounter }}</h4>
          </div>
          <div class="process-executing">
            <div
              class="animation-execution-wrapper"
              :class="{ 'animation-pause': !running }"
            >
              <ProcessCardComponent
                :class="{ 'animation-pause': !running }"
                v-if="currentProcessExecutionAnimate"
                id="current-process-executing"
                :process="currentProcessExecutionAnimate"
              ></ProcessCardComponent>
            </div>
            <ProcessCardComponent
              class="current-process"
              :class="{ 'animation-pause': !running }"
              v-if="currentProcessExecution"
              :process="currentProcessExecution"
            ></ProcessCardComponent>
          </div>
        </section>
        <section class="process-carriage-wrapper">
          <div><h3 style="color: white">carriage</h3></div>
          <section class="process-carriage">
            <ProcessCardComponent
              class="process-carriaging"
              :class="{ 'animation-pause': !running }"
              v-if="processCarriage"
              :process="processCarriage"
            ></ProcessCardComponent>
          </section>
        </section>
      </section>
      <section class="process-finished-wrapper" style="position: relative">
        <div class="text-finished">
          <h3>Terminado</h3>
        </div>
        <section
          class="processes-finished"
          :class="{ 'animation-pause': !running }"
          :style="`justify-content: ${styleFinish}`"
        >
          <div
            class="process-finished"
            :class="{ 'animation-pause': !running }"
          >
            <ProcessCardComponent
              :class="{ 'animation-pause': !running }"
              v-if="processFinished"
              :process="processFinished"
            ></ProcessCardComponent>
          </div>
          <div
            class="processes-finished-animate"
            :class="{ 'animation-pause': !running }"
            style="display: flex; width: fit-content; height: fit-content"
          >
            <template
              v-for="(process, index) in finishedProcesses"
              :key="index"
            >
              <ProcessCardComponent :process="process"></ProcessCardComponent>
            </template>
          </div>
        </section>
      </section>
    </section>
  </div>
  <ReportComponent
    v-if="showReport"
    style="position: absolute; z-index: 3"
    :processesPreemptive="processesPreemptive ?? []"
    :processesNonpreemptive="processesNonpreemptive ?? []"
    :processes="finishedProcesses"
    @onCloseReport="closeReport"
  ></ReportComponent>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, watch, defineEmits } from "vue";
import ReportComponent from "./ReportComponent.vue";
import ProcessCardComponent from "./ProcessCardComponent.vue";
import { writeProcessCharacter } from "@/services/api.service";
import { users } from "@/utils/utils";
import Process from "@/models/process.model";

const emits = defineEmits(['simulationIsRunning']);
const animationMoveToLeftDelay = 900;
const styleFinish = ref("end");
const props = defineProps<{ quantum: number; th: number; processes: any[]; inputsfilled: boolean }>();
const processList = ref<any[]>([]);
const finishedProcesses = ref<any[]>([]);
let currentProcessExecution = ref();
const currentProcessExecutionAnimate = ref();
const running = ref(false);
const paused = ref(false);
const processReadyToExecute = ref();
const processCarriage = ref();
const processFinished = ref();
const timeCount = ref(0);
const quantumCounter = ref(0);
const totalQuantum = ref(0);
const processHasEnded = ref(false);
let simulationInterval: number | null = null;
const simulationHasEnded = ref(false);
const isProcessBeingExecuted = ref(false);
const interval = ref(2500);
const processesPreemptive = ref<Process[]>();
const processesNonpreemptive = ref<Process[]>();
const showReport = ref(false);

onMounted(() => {
  processList.value = [...props.processes];
});

watch(props, (_) => {
  processList.value = [...props.processes];
});

const closeReport = () => {
  processesPreemptive.value = undefined;
  processesNonpreemptive.value = undefined;
  showReport.value = false;
  simulationHasEnded.value = false;
  stopSimulation();
};

const startSimulation = () => {
  running.value = true;
  paused.value = false;
  emits('simulationIsRunning', true);
  simulationInterval = setInterval(simulationStep, interval.value);
};

const pauseSimulation = () => {
  running.value = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  paused.value = true;
};

const resumeSimulation = () => {
  if (!running.value) {
    running.value = true;
    simulationInterval = setInterval(simulationStep, interval.value);
  }
};

const stopSimulation = () => {
  running.value = false;
  paused.value = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
  timeCount.value = 0;
  quantumCounter.value = 0;
  totalQuantum.value = 0;
  processHasEnded.value = false;
  processList.value = [...props.processes];
  finishedProcesses.value = [];
  processReadyToExecute.value = null;
  processCarriage.value = null;
  processFinished.value = null;
  currentProcessExecution.value = null;
  currentProcessExecutionAnimate.value = null;
  simulationHasEnded.value = false;
  emits('simulationIsRunning', false)
};

const simulationStep = () => {
  if (!running.value) {
    return;
  }
  animateProcessReady();
};

async function writeCharacterToFile(process: any) {
  await writeProcessCharacter(process.PID, process.name, process.description);
}

const animateProcessReady = async () => {
  const element = document.querySelector(".processes-wrapper");
  if (
    element &&
    !isProcessBeingExecuted.value &&
    processList.value.length > 0
  ) {
    if (finishedProcesses.value.length > 5) {
      styleFinish.value = "start";
    }

    if (!running.value) {
      return;
    }

    const processesFinishedElement = document.querySelector(
      ".processes-finished"
    );
    await delay(100);
    if (processesFinishedElement) {
      processesFinishedElement.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }

    element.classList.add("move-to-left");
    await delay(animationMoveToLeftDelay);

    element.classList.remove("move-to-left");

    const listAux = processList.value.length;
    let processAux = { ...processList.value.shift() };
    processReadyToExecute.value = processAux;

    await delay(100);

    const processToMoveFromCurrentToDown = document.querySelector(
      "#process-ready-to-execute"
    );
    if (processToMoveFromCurrentToDown) {
      processToMoveFromCurrentToDown.classList.add("move-to-execution");
      await delay(200);
    }

    console.log("first");

    currentProcessExecutionAnimate.value = processAux;

    await delay(100);

    console.log("second");

    processToMoveFromCurrentToDown?.classList.remove("move-to-execution");
    processReadyToExecute.value = null;
    const processToMoveFromUpToCurrent = document.querySelector(
      "#current-process-executing"
    );
    if (processToMoveFromUpToCurrent) {
      processToMoveFromUpToCurrent.classList.add("move-in-execution");
      await delay(animationMoveToLeftDelay);
      processToMoveFromUpToCurrent.classList.remove("move-in-execution");
      currentProcessExecutionAnimate.value = null;
    }

    console.log("third");

    currentProcessExecution.value = processAux;
    await delay(100);

    while (
      quantumCounter.value < props.quantum ||
      processAux.systemProcess || listAux === 1
    ) {
      isProcessBeingExecuted.value = true;
      await delay(props.th / 2);
      quantumCounter.value++;
      processAux.quantum++;
      timeCount.value++;
      let processToSlice = { ...processAux };
      processToSlice.description = processToSlice.description.slice(
        0,
        processToSlice.quantum
      );

      await writeCharacterToFile(processToSlice);

      await delay(props.th / 2);

      if (processToSlice.description.length >= processAux.description.length) {
        processHasEnded.value = true;
        break;
      }
    }

    totalQuantum.value += props.quantum;

    console.log("fourth");

    const processToMoveFromCurrentToRight =
      document.querySelector(".current-process");
    if (processToMoveFromCurrentToRight) {
      processToMoveFromCurrentToRight.classList.add("move-to-right");
      await delay(200);
      processToMoveFromCurrentToRight.classList.remove("move-to-right");
      currentProcessExecution.value = null;
    }

    console.log("fifth");

    processCarriage.value = processAux;
    await delay(100);
    const processCarriaging = document.querySelector(".process-carriaging");
    if (processCarriaging) {
      processCarriaging.classList.add("move-to-end");
      await delay(animationMoveToLeftDelay);
      processCarriaging.classList.remove("move-to-end");
    }

    console.log("sixth");
    processFinished.value = processAux;
    currentProcessExecution.value = null;

    await delay(100);

    quantumCounter.value = 0;

    isProcessBeingExecuted.value = false;
    if (processHasEnded.value) {
      const processFinishing = document.querySelector(".process-finished");
      if (processFinishing && finishedProcesses.value.length < 6) {
        processFinishing.classList.add("move-to-finish");

        if (finishedProcesses.value.length > 0) {
          await delay(100);
          const processTerminated = document.querySelector(
            ".processes-finished-animate"
          );
          if (processTerminated) {
            processTerminated.classList.add("move-to-left");
            await delay(900);
            processTerminated.classList.remove("move-to-left");
          }
        } else {
          await delay(700);
        }

        processFinishing.classList.remove("move-to-finish");
      }
      finishedProcesses.value.push(processAux);
      finishedProcesses.value = updateProcess(
        processAux,
        finishedProcesses.value
      );
    } else {
      processList.value.push(processAux);
      processList.value = updateProcess(processAux, processList.value);
    }

    processHasEnded.value = false;
    processFinished.value = null;

    if (processList.value.length <= 0) {
      running.value = false;
      simulationHasEnded.value = true;
    }
  }
  if (simulationHasEnded.value) {
    processesPreemptive.value = finishedProcesses.value
      .filter((p): boolean => !p.systemProcess)
      .map((p): Process => mapProcessPreemptive(p));
    processesNonpreemptive.value = finishedProcesses.value
      .filter((p): boolean => p.systemProcess)
      .map((p): Process => mapProcessPreemptive(p));
    showReport.value = true;
  }
};

const mapProcessPreemptive = (process: Process) => {
  return {
    ...process,
    p: process.name,
    tl: process.timeArrive,
    r: process.r,
    pr: process.priority,
    tr: process.tr,
    tf: process.tf,
  };
};

const updateProcess = (process: any, list: any[]) => {
  const totalTimeExecuted = timeCount.value;
  const times = process.timesExecuted + 1;
  list = list.map((p) => {
    if (p.PID === process.PID) {
      return {
        ...p,
        timesExecuted: times,
        tf: `${times * totalQuantum.value} (${totalTimeExecuted})`,
      };
    }
    return p;
  });
  return list;
};

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
</script>

<style scoped>
.move-to-finish {
  animation-name: moveToFinish;
  animation-duration: 1s;
  animation-play-state: running;
  animation-fill-mode: forwards;
}
.move-to-end {
  animation-name: moveToEnd;
  animation-duration: 1s;
  animation-play-state: running;
  animation-fill-mode: forwards;
}
.move-to-right {
  animation-name: moveToRight;
  animation-duration: 1s;
  animation-play-state: running;
  animation-fill-mode: forwards;
}
.move-in-execution {
  animation-name: moveInExecution;
  animation-duration: 1s;
  animation-play-state: running;
  animation-fill-mode: forwards;
}
.move-to-execution {
  animation-name: moveToExecution;
  animation-duration: 1s;
  animation-play-state: running;
  animation-fill-mode: forwards;
}
.move-to-left {
  animation-name: moveToLeft;
  animation-duration: 1s;
  animation-play-state: running;
  animation-fill-mode: forwards;
}

.animation-pause {
  animation-play-state: paused;
}

@keyframes moveToFinish {
  0% {
    transform: translateX(0);
  }
  80% {
    transform: translateX(-172px);
  }
  100% {
    transform: translateX(-172px);
  }
}

@keyframes moveToEnd {
  0% {
    transform: translateX(0);
  }
  80% {
    transform: translateX(900px);
  }
  100% {
    transform: translateX(900px);
  }
}

@keyframes moveToLeft {
  0% {
    transform: translateX(0);
  }
  60% {
    transform: translateX(-160px);
  }
  100% {
    transform: translateX(-160px);
  }
}

@keyframes moveToRight {
  0% {
    transform: translateX(0);
  }
  60% {
    transform: translateX(200px);
  }
  100% {
    transform: translateX(200px);
  }
}

@keyframes moveToExecution {
  0% {
    transform: translateX(0);
  }
  60% {
    transform: translateY(160px);
  }
  100% {
    transform: translateY(160px);
  }
}

@keyframes moveInExecution {
  0% {
    transform: translateY(0);
  }
  60% {
    transform: translateY(150px);
  }
  100% {
    transform: translateY(150px);
  }
}

.simulator-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: start;
  width: 95%;
  height: fit-content;
  background: white;
  margin: 20px;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.068);
}
.process-empty {
  display: flex;
  justify-content: end;
  width: 200px;
  min-width: 200px;
  height: 128px;
  max-height: 128px;
  box-sizing: border-box;
}
.processes-wrapper {
  display: flex;
}
.process-ready-wrapper {
  position: relative;
}
.processes-ready {
  position: relative;
  display: flex;
  padding: 10px;
  width: 90%;
  height: 160px;
  background: rgb(235, 235, 235);
  border-radius: 15px;
  box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.068) inset;
  margin-right: 20px;
  overflow-x: auto;
  overflow-y: hidden;
}
.processes-finished {
  position: relative;
  padding: 10px;
  width: 90%;
  height: 160px;
  background: rgb(235, 235, 235);
  border-radius: 15px;
  box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.068) inset;
  margin-right: 20px;
  margin-top: 20px;
  overflow-y: hidden;
  display: flex;
  overflow-x: auto;
}
.process-executing {
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 170px;
  background: rgb(235, 235, 235);
  border-radius: 15px;
  box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.068) inset;
  margin-right: 100px;
  margin-left: 20px;
}
.process-carriage-wrapper {
  width: 100%;
}
.process-carriage {
  position: relative;
  width: 100%;
  min-width: 100%;
  overflow: hidden;
  height: 100px;
  background: rgba(0, 0, 0, 0.384);
  box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.068) inset;
  border-radius: 15px;
  margin-right: 20px;
}
.animation-execution-wrapper {
  position: absolute;
  top: -127px;
  left: 30px;
  width: 150px;
  height: 128px;
}
.current-process {
  position: absolute;
  top: 23px;
  left: 30px;
}
.process-carriaging {
  position: absolute;
  top: -20px;
  left: -150px;
  filter: blur(2px);
  opacity: 0.5;
}
.process-finished {
  position: absolute;
  top: 10px;
  right: -160px;
  z-index: 2;
}
.text-ready {
  position: absolute;
  top: 50px;
  left: 60px;
  z-index: 1;
}
.text-execution {
  position: absolute;
  top: 100px;
  left: 10px;
  z-index: 1;
}
.text-finished {
  position: absolute;
  top: 50px;
  left: 30px;
  z-index: 1;
}
h3 {
  font-size: 1.5em;
  color: rgba(0, 0, 0, 0.144);
  text-align: start;
}
.quantum-counter {
  position: absolute;
  top: 75px;
  left: 232px;
  padding: 5px;
  border-radius: 10px;
  border: 2px dashed gray;
}
button {
  border: none;
}
#buttons {
  font-size: 1.5em;
  cursor: pointer;
  color: rgb(0, 73, 0);
}
#buttons:hover {
  color: blue;
}
#buttons.desactive {
  color: gray;
}
</style>
