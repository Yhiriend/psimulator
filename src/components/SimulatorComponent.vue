<template>
  <div>
    <button @click="startSimulation">Iniciar Simulación</button>
    <button @click="pauseSimulation">Pausar Simulación</button>
    <button @click="resumeSimulation">Reanudar Simulación</button>
    <p style="font-size: 20; font-weight: bold">Time: {{ timeCount }}</p>
    <!-- Lista de procesos -->
    <section class="simulator-wrapper">
      <section class="process-ready-wrapper">
        <div class="text-ready"><h3>Listo</h3></div>
        <section class="processes-ready">
          <div class="process-empty">
            <ProcessCardComponent
              id="process-ready-to-execute"
              :process="processReadyToExecute"
              v-if="processReadyToExecute"
            ></ProcessCardComponent>
          </div>
          <div class="processes-wrapper">
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
            <div class="animation-execution-wrapper">
              <ProcessCardComponent
                v-if="currentProcessExecutionAnimate"
                id="current-process-executing"
                :process="currentProcessExecutionAnimate"
              ></ProcessCardComponent>
            </div>
            <ProcessCardComponent
              class="current-process"
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
          :style="`justify-content: ${styleFinish}`"
        >
          <div class="process-finished">
            <ProcessCardComponent
              v-if="processFinished"
              :process="processFinished"
            ></ProcessCardComponent>
          </div>
          <div
            class="processes-finished-animate"
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
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, watch } from "vue";
import ProcessCardComponent from "./ProcessCardComponent.vue";
import { writeProcessCharacter } from "@/services/api.service";

const animationMoveToLeftDelay = 900;
const styleFinish = ref("end");
const props = defineProps<{ quantum: number; th: number; processes: any[] }>();
const processList = ref<any[]>([]);
const finishedProcesses = ref<any[]>([]);
let currentProcessExecution = ref();
const currentProcessExecutionAnimate = ref();
let running = false;
const processReadyToExecute = ref();
const processCarriage = ref();
const processFinished = ref();
const timeCount = ref(0);
const quantumCounter = ref(0);
const processHasEnded = ref(false);

onMounted(() => {
  processList.value = [...props.processes];
});

watch(props, (_) => {
  processList.value = [...props.processes];
});

// Función para iniciar la simulación
const startSimulation = async () => {
  //processList = [...props.processes];
  //simulateRoundRobin(processList.value, props.quantum, props.th);
  const element = document.querySelector(".processes-wrapper");
  animateProcessReady(element);
};

// Función para pausar la simulación
const pauseSimulation = () => {
  running = false;
};

// Función para reanudar la simulación
const resumeSimulation = () => {
  if (!running) {
    simulateRoundRobin(processList.value, props.quantum, props.th);
  }
};

async function simulateRoundRobin(
  processes: any[],
  quantum: number,
  th: number
) {
  // Set running to true to indicate the simulation is active
  running = true;

  // Initialize the start time
  const startTime = Date.now();

  // Helper function to create a delay
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Main simulation loop
  while (processList.value.length > 0 && running) {
    for (let i = 0; i < processes.length; i++) {
      if (!running) break; // Check if the simulation is paused

      let process = processList.value[i];
      currentProcessExecution = process;
      process.state = "En ejecucion";

      // Calculate execution time per quantum
      const executionTime = Math.min(quantum, process.tr);
      const charsToWrite = Math.floor(executionTime / th);

      // Simulate process execution
      for (let j = 0; j < charsToWrite; j++) {
        if (!running) break; // Check if the simulation is paused
        await writeCharacterToFile(process);
        await delay(th);
      }

      // Update remaining execution time
      process.tr -= executionTime;

      if (process.tr <= 0) {
        // Process has completed its activity
        process.state = "Finalizado";
        finishedProcesses.value.push(process);
        processes.splice(i, 1);
        i--; // Adjust the index after removal
      } else {
        // Process is preemptive and goes back to the ready state
        process.state = "Listo";
      }

      // Calculate and update times for process
      process.executionCount = process.executionCount || 0;
      process.executionCount++;
      process.finishTime = quantum * process.executionCount;
    }
  }

  // Mark simulation as completed
  //currentProcessExecution = null;
  running = false;
}

async function writeCharacterToFile(process: any) {
  await writeProcessCharacter(process.PID, process.name, process.description);
}

const animateProcessReady = async (element: Element | null) => {
  if (element) {
    if (finishedProcesses.value.length === 6) {
      styleFinish.value = "start";
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
    currentProcessExecutionAnimate.value = processAux;
    await delay(100);
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
    currentProcessExecution.value = processAux;
    await delay(100);

    //TODO: 🕗 EN EJECUCION
    while (quantumCounter.value < props.quantum) {
      await delay(500);
      quantumCounter.value++;
      processAux.quantum++;
      timeCount.value++;
      let processToSlice = { ...processAux };
      processToSlice.description = processToSlice.description.slice(
        0,
        processToSlice.quantum
      );

      await writeCharacterToFile(processToSlice);

      await delay(500);

      if (processToSlice.description.length >= processAux.description.length) {
        processHasEnded.value = true;
      }
    }

    const processToMoveFromCurrentToRight =
      document.querySelector(".current-process");
    if (processToMoveFromCurrentToRight) {
      processToMoveFromCurrentToRight.classList.add("move-to-right");
      await delay(200);
      processToMoveFromCurrentToRight.classList.remove("move-to-right");
      currentProcessExecution.value = null;
    }
    processCarriage.value = processAux;
    await delay(100);
    const processCarriaging = document.querySelector(".process-carriaging");
    if (processCarriaging) {
      processCarriaging.classList.add("move-to-end");
      await delay(animationMoveToLeftDelay);
      processCarriaging.classList.remove("move-to-end");
      currentProcessExecution.value = null;
    }
    processFinished.value = processAux;

    await delay(100);

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
    } else {
      processList.value.push(processAux);
    }
    updateProcess(processAux);

    quantumCounter.value = 0;
    processHasEnded.value = false;
    processFinished.value = null;
  }
};

const updateProcess = (process: any) => {
  const times = process.timesExecuted + 1;
  processList.value = processList.value.map((p) => {
    if (p.PID === process.PID) {
      return {
        ...p,
        timesExecuted: times,
      };
    }
    return p;
  });
};

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
</script>

<style scoped>
.move-to-finish {
  animation-name: moveToFinish;
  animation-duration: 1s;
}
.move-to-end {
  animation-name: moveToEnd;
  animation-duration: 1s;
}
.move-to-right {
  animation-name: moveToRight;
  animation-duration: 1s;
}
.move-in-execution {
  animation-name: moveInExecution;
  animation-duration: 1s;
}
.move-to-execution {
  animation-name: moveToExecution;
  animation-duration: 1s;
}
.move-to-left {
  animation-name: moveToLeft;
  animation-duration: 1s;
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
  width: 1000px;
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
  height: 140px;
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
  height: 140px;
  background: rgb(235, 235, 235);
  border-radius: 15px;
  box-shadow: 10px 10px 5px rgba(0, 0, 0, 0.068) inset;
  margin-right: 20px;
  margin-top: 20px;
  overflow-y: hidden;
  display: flex;
  overflow-x: scroll;
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
  top: 110px;
  left: 232px;
  padding: 5px;
  border-radius: 10px;
  border: 2px dashed gray;
}
</style>
