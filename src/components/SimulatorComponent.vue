<!-- eslint-disable prettier/prettier -->
<template>
    <div style="margin: 20px 0 0 0">
        <button @click="startSimulation" :disabled="simulationRunning"><i class="bi bi-play-fill"></i></button>
        <button @click="pauseSimulation" :disabled="!simulationRunning">
            <i class="bi bi-pause-circle-fill"></i>
        </button>
        <button @click="stopSimulation"><i class="bi bi-stop-circle-fill"></i></button>
        <p style="color: black;">Tiempo: {{ processReady[processReady.length - 1]?.tf ??
            processEnded[processEnded.length - 1]?.tf }}</p>
    </div>
    <div class="wrapper">
      <h3>Listo</h3>
        <div style="width: 95%; display: flex; justify-content: start">
          <div class="first-processes-wrapper">
            <ProcessCardComponent v-if="firstProcessReady" :process="firstProcessReady" process-id="first-process-ready"></ProcessCardComponent>

          </div>

            <div class="processes-wrapper">
                <template v-for="(process, index) in processReady ?? []" :key="index">
                    <ProcessCardComponent :process="process"></ProcessCardComponent>
                </template>
            </div>
        </div>
        <div style="width: 20px"></div>
        <div>
            <h3>En ejecucion</h3>
            <div class="processes-wrapper" v-if="hasInitSimulation">
                <ProcessCardComponent :process="procesoEnEjecucion"></ProcessCardComponent>
            </div>
        </div>
        <div style="width: 20px"></div>
        <div style="width: 95%;">
            <h3>Terminado</h3>
            <div class="processes-wrapper" v-if="hasInitSimulation || !hasEndedSimulation">
                <template v-for="(process, index) in processEnded ?? []" :key="index">
                    <div class="process" :style="{ background: process.color ?? '#3D8CC7' }" id="ended">
                        <p style="font-size: large; font-weight: bold;">{{ process.name }}</p>
                        <p class="pid"><span style="color: black; opacity: 0.5">PID</span> {{ process.PID }}</p>
                        <p class="timearrive"><span style="color: black; opacity: 0.5">T.L.</span> {{
                            process.timeArrive ?? 0 }}</p>
                        <p class="timeended"><span style="color: black; opacity: 0.5">T.F.</span> {{
                            process.currentTime }}</p>
                        <p class="timesexe"><span style="color: black; opacity: 0.5">Ejecuciones</span> {{
                            process.timesExecuted ?? 0 }}</p>
                    </div>
                </template>
            </div>
        </div>
    </div>
    <audio ref="audio" id="miAudio">
        <source src="../assets/sounds/sound01.mp3">
    </audio>

</template>
<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, onUpdated, watch, ref, computed } from 'vue';
import Process from '../models/process.model';
import ProcessCardComponent from "@/components/ProcessCardComponent.vue";
const props = defineProps<{ modelValue: any; processes: Process[]; quantum: number; }>()
const processReady = ref<Process[]>([]);
const processExecuted = ref<Process[]>([]);
const processEnded = ref<Process[]>([]);
const simulationRunning = ref(false);
const hasInitSimulation = ref(false);
const hasEndedSimulation = ref(false);
const procesoEnEjecucion = ref();
const firstProcessReady = ref<Process>();
const tiempoActual = ref(0);
const cicleTimeSimulation = 1000;
const miAudio = ref();
const indexProcessReady = ref(0);
watch(props, (newValue) => {
    if (!simulationRunning.value) {
        //const copi = JSON.stringify(newValue.modelValue?.processReady || []);
        const copi = newValue.modelValue?.processReady || [];
        processReady.value = copi.slice(1, copi.length)
        firstProcessReady.value = copi[0];
    }
});

const pauseSimulation = () => {
    if (simulationRunning.value) {
        simulationRunning.value = false;
    }
}

const startSimulation = async () => {
    hasInitSimulation.value = true;
    simulationRunning.value = true;
    simulateRR(processReady.value, processExecuted.value, processEnded.value, props.quantum);
}

onMounted(() => {
    miAudio.value = document.getElementById("miAudio") as HTMLAudioElement;

})

const simulateRR = async (listo: Process[], ejecucion: Process[], terminado: Process[], quantum: number) => {
    //const result: RRResult = { ejecucion: [], terminado: [] };

    let totalQuantums = 0;
    while (listo.length > 0 || ejecucion.length > 0) {

        if (!simulationRunning.value) {
            break;
        }

        if (ejecucion.length === 0 && listo.length > 0) {
          await delay(cicleTimeSimulation);

          if (firstProcessReady.value?.timeArrive === 0) {
            await startAnimationSlideDownRec();

          }
            // await delay(700);
            // await startAnimationFirstProcessReady();
            // miAudio.value.play();
          if (!procesoEnEjecucion.value){
            procesoEnEjecucion.value = firstProcessReady.value!
            firstProcessReady.value = undefined;
          }

          firstProcessReady.value = listo.shift();
        }

        //const procesoActual = ejecucion[0];
        //let tiempoRestante = procesoActual.tr! - quantum;

        //procesoEnEjecucion.value = procesoActual;

      // procesoActual.timesExecuted! += 1;
      // totalQuantums += quantum;
      // if (tiempoRestante > 0) {
      //   procesoActual.tr = tiempoRestante;
      //   await delay(cicleTimeSimulation);
      //   // startAnimationSlideUp();
      //   // await delay(500);
      //   listo.push(procesoActual);
      //   ejecucion.shift();
      //   // miAudio.value.play();
      // } else {
      //   if (tiempoRestante < 0) {
      //     totalQuantums = totalQuantums + tiempoRestante;
      //   }
      //   procesoActual.timesExecuted = procesoActual.timesExecuted!++;
      //   await delay(cicleTimeSimulation);
      //   // startAnimationSlideDown();
      //   // await delay(500);
      //   procesoActual.currentTime! = totalQuantums;
      //   terminado.push(procesoActual);
      //   ejecucion.shift();
      //   // miAudio.value.play();
      // }
      //
      // if (terminado.includes(procesoActual) || listo.includes(procesoActual)) {
      //
      //   procesoEnEjecucion.value = null;
      // }

        console.log('Simulando...');
        tiempoActual.value += 1;
    }

    procesoEnEjecucion.value = null;
    simulationRunning.value = false;

    if (processReady.value.length === 0 && !procesoEnEjecucion.value) {
        hasEndedSimulation.value = false;
        hasInitSimulation.value = false;
    }
    console.log("Simulacion finalizada");
    //return null;
}

const startAnimationSlideDown = () => {
    const firstProcess = document.getElementById('execution');
    if (firstProcess) {
        firstProcess.classList.add('slide-down-animation');
    }
}

const startAnimationFirstProcessReady = async () => {
    const firstProcess = document.getElementById('first-process-ready');
    if (firstProcess) {
        firstProcess.classList.toggle('slide-from-right-to-left');
        await delay(600);
      firstProcess.classList.toggle('slide-from-right-to-left');
    }
}

const startAnimationSlideUp = () => {
    const firstProcess = document.getElementById('execution');
    if (firstProcess) {
        firstProcess.classList.add('slide-up-animation');
    }
}

const startAnimationSlideDownRec = async () => {
    const firstProcess = document.getElementById('first-process-ready');
    await delay(500);
    if (firstProcess) {
        firstProcess.classList.add('slide-down-rec-animation');
        //indexProcessReady.value += 1;
        await delay(700);
    }
}


const stopSimulation = () => {
    simulationRunning.value = false;
    processEnded.value = [];
    processExecuted.value = [];
    procesoEnEjecucion.value = null;
    const copi = JSON.stringify(props.modelValue?.processReady || []);
    processReady.value = JSON.parse(copi);
    console.log("processes :", processReady.value);
    hasInitSimulation.value = false;
    hasEndedSimulation.value = true;
    tiempoActual.value = 0;
}

const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

</script>
<!-- eslint-disable prettier/prettier -->
<style scoped>
/*#ended {
    background: #2CBE6E;
}

#execution {
    background: #ECBE08;
}

#ready {
    background: #3D8CC7;
}*/

.slide-down-animation {
    animation-name: slideDown;
    animation-duration: 0.6s;
}

@keyframes slideDown {
    from {
        transform: translateX(0) translateY(0);
    }

    to {
        transform: translateX(200px) translateY(100px);
    }
}

.slide-from-right-to-left {
  animation-name: slideRightToLeft;
  animation-duration: 0.6s;
}

@keyframes slideRightToLeft {
  from {
    transform: translateX(200px);
  }

  to {
    transform: translateX(0);
  }
}

.slide-up-animation {
    animation-name: slideUp;
    animation-duration: 0.7s;
}


@keyframes slideUp {
    from {
        transform: translateX(0) translateY(0);
    }

    to {
        transform: translateX(200px) translateY(-100px);
    }
}

.slide-down-rec-animation {
    animation-name: slideDownRec;
    animation-duration: 0.7s;
}

@keyframes slideDownRec {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateY(210px);
    }
}

h3 {
    text-align: start
}

.wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    background: white;
    border-radius: 20px;
    padding: 20px;
    margin: 10px 30px 30px 30px;
    box-shadow: 10px 10px 20px 1px rgba(0, 0, 0, 0.11);
}

.first-processes-wrapper{
  position: relative;
  display: flex;
  border: 1px solid rgb(233, 233, 233);
  border-radius: 15px;
  padding: 8px 14px;
  height: 140px;
  width: 130px;
}

.processes-wrapper {
    position: relative;
    display: flex;
    border: 1px solid rgb(233, 233, 233);
    border-radius: 15px;
    padding: 8px 14px;
    height: 140px;
    width: fit-content;
    min-width: 20%;
    max-width: 80%;
    overflow-x: auto;
}

.process {
    border: 1px solid rgb(48, 48, 48);
    border-radius: 15px;
    margin-right: 10px;
    padding: 8px 14px;
    transition: opacity 0.3s ease-in-out;
    width: 100px;
    min-width: 100px;
    min-height: 120px;
    height: 120px;
}

#execution {
    position: absolute;
    width: 100px;
    min-width: 100px;
    min-height: 120px;
    height: 120px;
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
