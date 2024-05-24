import { ref, defineProps, onMounted, watch, computed } from "vue";
import { writeProcessCharacter } from "@/services/api.service";
import { users } from "@/utils/utils";

const animationMoveToLeftDelay = 900;
const styleFinish = ref("end");
const props = defineProps<{ quantum: number; th: number; processes: any[] }>();
const processList = ref<any[]>([]);
const finishedProcesses = ref<any[]>([]);
let currentProcessExecution = ref();
const currentProcessExecutionAnimate = ref();
const running = ref(false);
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

onMounted(() => {
  processList.value = [...props.processes];
});

watch(props, (_) => {
  processList.value = [...props.processes];
});

const startSimulation = () => {
  running.value = true;
  simulationInterval = setInterval(simulationStep, interval.value);
};

const pauseSimulation = () => {
  running.value = false;
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
  }
};

const resumeSimulation = () => {
  if (!running.value) {
    running.value = true;
    simulationInterval = setInterval(simulationStep, interval.value);
  }
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
  if (element && !isProcessBeingExecuted.value) {
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

    debugger;

    element.classList.add("move-to-left");
    await delay(animationMoveToLeftDelay);
    if (!running.value) {
      return;
    }

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

    if (!running.value) {
      return;
    }
    await delay(100);

    debugger;

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

    if (!running.value) {
      return;
    }
    while (
      quantumCounter.value < props.quantum ||
      users.includes(processAux.user)
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

    if (!running.value) {
      return;
    }
    totalQuantum.value += props.quantum;

    const processToMoveFromCurrentToRight =
      document.querySelector(".current-process");
    if (processToMoveFromCurrentToRight) {
      processToMoveFromCurrentToRight.classList.add("move-to-right");
      await delay(200);
      processToMoveFromCurrentToRight.classList.remove("move-to-right");
      currentProcessExecution.value = null;
    }

    if (!running.value) {
      return;
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

    if (!running.value) {
      return;
    }
    processFinished.value = processAux;

    await delay(100);

    quantumCounter.value = 0;

    if (!running.value) {
      return;
    }

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
