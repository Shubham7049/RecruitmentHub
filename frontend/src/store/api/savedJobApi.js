import { apiSlice } from "./apiSlice";

export const savedJobApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMySavedJobs: builder.query({
      query: () => "/saved-jobs/my",
      providesTags: ["SavedJob"],
    }),
    checkIsJobSaved: builder.query({
      query: (jobId) => `/saved-jobs/check/${jobId}`,
      providesTags: (result, error, jobId) => [{ type: "SavedJob", id: jobId }],
    }),
    saveJob: builder.mutation({
      query: (jobId) => ({
        url: `/saved-jobs/${jobId}`,
        method: "POST",
      }),
      invalidatesTags: (result, error, jobId) => [
        "SavedJob",
        { type: "SavedJob", id: jobId },
      ],
    }),
    unsaveJob: builder.mutation({
      query: (jobId) => ({
        url: `/saved-jobs/${jobId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, jobId) => [
        "SavedJob",
        { type: "SavedJob", id: jobId },
      ],
    }),
  }),
});

export const {
  useGetMySavedJobsQuery,
  useCheckIsJobSavedQuery,
  useSaveJobMutation,
  useUnsaveJobMutation,
} = savedJobApi;
