import { GIF_API_ENDPOINTS } from "@/constants/apiConstants";
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

export interface TenorApiResponse {
  results: TenorGif[];
  next?: string;
}

export const searchTenorGifs = async (
  query: string,
  limit: number = 20,
  pos?: string
): Promise<TenorApiResponse> => {
  const response = await axios.get(GIF_API_ENDPOINTS.SEARCH, {
    params: {
      q: query,
      limit,
      pos,
    },
  });
  return response.data;
};

export const getTrendingGifs = async (
  limit: number = 20,
  pos?: string
): Promise<TenorApiResponse> => {
  const response = await axios.get(GIF_API_ENDPOINTS.TRENDING, {
    params: {
      limit,
      pos,
    },
  });
  return response.data;
};
