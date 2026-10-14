import { apiSlice } from "./apiSlice";

export const interviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyInterviews: builder.query({
      query: () => "/interviews/my",
      providesTags: ["Interview"],
    }),
    getInterviewById: builder.query({
      query: (id) => `/interviews/${id}`,
      providesTags: (result, error, id) => [{ type: "Interview", id }],
    }),
    scheduleInterview: builder.mutation({
      query: (interviewData) => ({
        url: "/interviews",
        method: "POST",
        body: interviewData,
      }),
      invalidatesTags: ["Interview", "Application"],
    }),
    updateInterview: builder.mutation({
      query: ({ id, ...interviewData }) => ({
        url: `/interviews/${id}`,
        method: "PATCH",
        body: interviewData,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Interview",
        { type: "Interview", id },
      ],
    }),
    cancelInterview: builder.mutation({
      query: (id) => ({
        url: `/interviews/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        "Interview",
        "Admin",
        { type: "Interview", id },
      ],
    }),
  }),
});

export const {
  useGetMyInterviewsQuery,
  useGetInterviewByIdQuery,
  useScheduleInterviewMutation,
  useUpdateInterviewMutation,
  useCancelInterviewMutation,
} = interviewApi;
