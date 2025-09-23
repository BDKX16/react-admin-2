import { createContext, useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { createUser, modifyUser } from "../redux/states/user";
import { enqueueSnackbar } from "notistack";
import { loadAbort } from "@/utils/load-abort-controller";
import axios from "axios";
import PropTypes from "prop-types";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchSubscriptionStatus = useCallback(
    async (token) => {
      try {
        const controller = loadAbort();
        const headers = {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        };

        const response = await axios.get(
          import.meta.env.VITE_BASE_URL + "/subscription-status",
          {
            ...headers,
            signal: controller.signal,
          }
        );

        if (response.data && response.data.plan) {
          // Actualizar el plan en el estado del usuario
          const currentUserData = JSON.parse(localStorage.getItem("userData"));
          const updatedUserData = {
            ...currentUserData,
            plan: response.data.plan,
          };

          localStorage.setItem("userData", JSON.stringify(updatedUserData));
          dispatch(modifyUser({ plan: response.data.plan }));
          setAuth((prevAuth) => ({
            ...prevAuth,
            userData: { ...prevAuth.userData, plan: response.data.plan },
          }));
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        // No mostrar error al usuario, usar plan por defecto
      }
    },
    [dispatch]
  );

  const authUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (!token || !userData) {
      setLoading(false);
      return false;
    }

    const parsedUserData = JSON.parse(userData);
    const cleanToken = token.replace(/"/g, ""); // Remover comillas si existen

    dispatch(createUser(parsedUserData));
    setAuth({ token: cleanToken, userData: parsedUserData });

    // Obtener estado actual de la suscripción
    await fetchSubscriptionStatus(cleanToken);

    setLoading(false);
  }, [dispatch, fetchSubscriptionStatus]);

  useEffect(() => {
    authUser();
  }, [authUser]);

  const setUserData = useCallback(
    async (data) => {
      localStorage.setItem("token", JSON.stringify(data.token));
      localStorage.setItem("userData", JSON.stringify(data));

      dispatch(createUser(data));
      setAuth({ token: data.token, userData: data });

      // Obtener estado actual de la suscripción después del login
      if (data.token) {
        await fetchSubscriptionStatus(data.token);
      }
    },
    [dispatch, fetchSubscriptionStatus]
  );

  const logout = () => {
    enqueueSnackbar("Logout successfully", { variant: "success" });
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setAuth({});
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        loading,
        setUserData,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
