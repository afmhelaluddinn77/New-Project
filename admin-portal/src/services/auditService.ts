import axios from "axios";

const API_URL = "http://localhost:3000/api/encounters/audit";

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
}

export const getAuditLogs = async (filters: {
  user?: string;
  action?: string;
  date?: string;
}) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(API_URL, {
    params: filters,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
