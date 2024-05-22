# Requerimientos

(DONE) - Obtener datos de los procesos mediante servicios

- Un proceso es liberado de la CPU si
  - culminó su actividad en su totalidad
  - el proceso es expulsivo
- El proceso pasa de EJECUCION a LISTO si cumple que el proceso es expulsivo
- La unidad de tiempo es dada en milisegundos
- TH en milisegundos
- TR=TH\*(cantidad de caracteres en la descripcion)
- La simulacion puede ser interrumpida y reanudada en cualquier momento
- Cada proceso debe mantener su propio hilo de ejecucion
  - El tiempo asumido en cada caracter copiado en el archivo corresponde a TH
    tiempo que determina cuanto debe esperar el hilo para nuevamente iniciar
    su actividad.
- El tiempo de llegada de cada proceso se determina asi:
  - Si listo es vacio: Tiempo de llegada <- 0
  - sino: Tiempo de llegada <- process_index + 1
- El tiempo de finalizacion se calcula:
  - Tiempo de finalizacion <- Quantum \* #Ejecuciones

# Actividad de un Proceso

Todo proceso tiene como actividad crear un archivo con el nombre del proceso y
su contenido es la descripción. Por cada carácter copiado en el archivo el proceso
ha disminuido su número de ejecuciones. Es decir, ha utilizado un quantum
