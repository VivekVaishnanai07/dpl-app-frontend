import api from "@/api/api";

export const getPlayerBoard = async (tournamentId: number, groupId: number) => {
  try {
    const response = await api.get(`/player-board/filter/${tournamentId}/${groupId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching player-board:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch player-board");
  }
};

export const getPointsPlayerBoard = async (tournamentId: number, groupId: number) => {
  try {
    const response = await api.get(`/player-board/${tournamentId}/${groupId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching player-board:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch player-board");
  }
};