import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState } from '../store';
import { setCredentials, logout as logoutAction, setLoading } from '../store/slices/authSlice';
import { apiClient } from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch(setLoading(true));
        const data = await apiClient.login(email, password);

        dispatch(
          setCredentials({
            user: data.user,
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
          })
        );

        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Login failed',
        };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        dispatch(setLoading(true));
        const data = await apiClient.register(name, email, password);

        dispatch(
          setCredentials({
            user: data.user,
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
          })
        );

        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Registration failed',
        };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
};
