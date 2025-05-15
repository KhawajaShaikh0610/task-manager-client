import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const getCookieData = (cookieName) => {
  const cookieValue = Cookies.get(cookieName);
  try {
    return cookieValue ? JSON.parse(cookieValue) : null;
  } catch (error) {
    console.error(`Error parsing ${cookieName} cookie:`, error);
    return null;
  }
};

export const taskApi = createApi({
  reducerPath: "taskApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1",
    prepareHeaders: (headers) => {
      const userToken = getCookieData("user")?.token;
      if (userToken) {
        headers.set("Authorization", `Bearer ${userToken}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    // getTasks: builder.query({
    //   query: (id) => ({
    //     url: `/task/${id}`,
    //     method: "GET",
    //   }),
    //   providesTags: ["Task"],
    // }),
    getTasks: builder.query({
      query: ({ userId, page = 1, limit = 10 }) => ({
        url: `/task/${userId}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Task"],
    }),

    createTask: builder.mutation({
      query: (task) => ({
        url: "/task",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Task"],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/task/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
    }),
    updateTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `/task/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} = taskApi;
