import api from "@/api/api";

export const getTeams = async (tournamentId: number) => {
  try {
    const response = await api.get(`/team/tournament/${tournamentId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch teams");
  }
};