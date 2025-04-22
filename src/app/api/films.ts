import apiClient from "./config";

export interface Film {
  _id: string;
  name: string;
  price: number;
  seatQuantity: number;
  img: string;
}

export const getFilms = async (): Promise<Film[]> => {
  try {
    return await apiClient.get("/films");
  } catch (error) {
    console.error("Error fetching films:", error);
    throw error;
  }
};

export const getFilmById = async (id: string): Promise<Film> => {
  try {
    return await apiClient.get(`/films/${id}`);
  } catch (error) {
    console.error(`Error fetching film with id ${id}:`, error);
    throw error;
  }
};
