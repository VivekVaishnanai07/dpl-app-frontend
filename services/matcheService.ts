import api from "@/api/api";

export const getDashboardMatchesList = async (tournamentId: number, teamName: string | null) => {
  try {
    const response = await api.post(`/matches/${tournamentId}`, { "teamName": teamName?.length === 0 ? null : teamName });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching match list:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch match list");
  }
};

export const getMatchDetails = async (matchId: number) => {
  try {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching match:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch match");
  }
};

export const getMatchesList = async (userId: number, tournamentId: number) => {
  try {
    const response = await api.get(`/matches/list/${userId}/${tournamentId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching match:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch match");
  }
};

export const createMatch = async (updateData: any) => {
  try {
    const response = await api.post(`/matches/new/add-match`, updateData);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching match:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch match");
  }
};