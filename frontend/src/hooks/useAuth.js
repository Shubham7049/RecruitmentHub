import { useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectCurrentToken,
  selectIsAuthenticated,
  selectUserRole,
  selectAuthLoading,
  selectIsInitializing,
} from "../store/slices/authSlice";
import { ROLES } from "../constants/roles";

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  const isLoading = useSelector(selectAuthLoading);
  const isInitializing = useSelector(selectIsInitializing);

  return {
    user,
    token,
    isAuthenticated,
    role,
    isStudent: role === ROLES.STUDENT,
    isRecruiter: role === ROLES.RECRUITER,
    isAdmin: role === ROLES.ADMIN,
    isLoading,
    isInitializing,
  };
};
