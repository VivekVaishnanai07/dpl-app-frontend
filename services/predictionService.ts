import api from "@/api/api";

export const getUserPrediction = async (userId: number, matchId: number, otherData: any) => {
  try {
    const response = await api.post(`/prediction/${userId}/${matchId}`, otherData);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching prediction:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch prediction");
  }
};

export const updatePrediction = async (data: any) => {
  try {
    const response = await api.put(`/prediction/${data.teamId}/${data.predictionId}/${data.matchId}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching prediction:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch prediction");
  }
};

export const addPrediction = async (payloadData: any) => {
  try {
    const response = await api.post(`/prediction/add-prediction`, payloadData);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching prediction:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch prediction");
  }
};

export const getPredictedUserList = async (matchId: number, payloadData: any) => {
  try {
    const response = await api.post(`/prediction/${matchId}`, payloadData);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching prediction:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch prediction");
  }
};