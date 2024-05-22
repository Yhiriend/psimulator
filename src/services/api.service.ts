/* eslint-disable */
import axios from "axios";
export interface Catalogue {
  id: number;
  name: string;
  processes: Process[];
}
export interface Process {
  id: number;
  PID: string;
  name: string;
  user: string;
  description: string;
  priority: number;
  id_catalogue: number;
}

const baseUrl = "http://localhost:3000";

export async function fetchCatalogues(): Promise<Catalogue[]> {
  try {
    const response = await axios.get(`${baseUrl}/catalogue`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los catálogos:", error);
    throw new Error("Error al obtener los catálogos");
  }
}

export async function writeProcessCharacter(
  PID: string,
  name: string,
  description: string
): Promise<any> {
  try {
    const response = await axios.post(
      `${baseUrl}/createTxtFile`,
      {
        PID,
        name,
        description,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener los catálogos:", error);
    throw new Error("Error al obtener los catálogos");
  }
}
