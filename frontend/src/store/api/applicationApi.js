import { apiSlice } from "./apiSlice";

export const applicationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    applyForJob: builder.mutation({
      query: (jobId) => ({
        url: `/applications/apply/${jobId}`,
        method: "POST",
      }),
      invalidatesTags: ["Application", "Job"],
    }),
    getMyApplications: builder.query({
      query: () => "/applications/my",
      providesTags: ["Application"],
    }),
    getApplicantsForJob: builder.query({
      query: (jobId) => `/applications/job/${jobId}`,
      providesTags: ["Application"],
    }),
    getApplicationById: builder.query({
      query: (id) => `/applications/${id}`,
      providesTags: (result, error, id) => [{ type: "Application", id }],
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/applications/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        "Application",
        { type: "Application", id },
      ],
    }),
  }),
});

export const {
  useApplyForJobMutation,
  useGetMyApplicationsQuery,
  useGetApplicantsForJobQuery,
  useGetApplicationByIdQuery,
  useUpdateApplicationStatusMutation,
} = applicationApi;
