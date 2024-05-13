/* eslint-disable prettier/prettier */
export default interface Process {
  id: number;
  PID: number;
  name: string;
  user: string;
  description: string;
  priority: number;
  id_catalogue: number;
  tr?: number;
  tf?: number;
  timesExecuted?: number;
}
