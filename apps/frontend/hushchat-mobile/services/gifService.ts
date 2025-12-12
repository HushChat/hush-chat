import { logError } from "@/utils/logger";
import axios from "axios";

export interface TenorGif {
  id: string;
  title: string;
  media_formats: {
    gif: {
      url: string;
      duration: number;
      dims: number[];
      size: number;
    };
    tinygif: {
      url: string;
      duration: number;
      dims: number[];
      size: number;
    };
  };
  content_description: string;
  itemurl: string;
  url: string;
  tags: string[];
  created: number;
}

export const searchTenorGifs = async (query: string, limit: number = 20): Promise<TenorGif[]> => {
  try {
    const response = await axios.get(`tenor/search`, {
      params: {
        q: query,
        limit,
      },
    });
    return response.data.results;
  } catch (error) {
    logError("error searching Tenor GIFs:", error);
    return [];
  }
};

export const getTrendingGifs = async (limit: number = 20): Promise<TenorGif[]> => {
  try {
    const response = await axios.get(`tenor/featured`, {
      params: {
        limit,
      },
    });
    return response.data.results;
  } catch (error) {
    logError("error loading trending GIFs:", error);
    return [];
  }
};
