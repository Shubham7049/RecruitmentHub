import { apiSlice } from "./apiSlice";

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => "/profiles/me",
      providesTags: ["Profile"],
    }),
    createProfile: builder.mutation({
      query: (profileData) => ({
        url: "/profiles",
        method: "POST",
        body: profileData,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateMyProfile: builder.mutation({
      query: (profileData) => ({
        url: "/profiles/me",
        method: "PATCH",
        body: profileData,
      }),
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useCreateProfileMutation,
  useUpdateMyProfileMutation,
} = profileApi;
