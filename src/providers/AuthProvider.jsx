import React, { createContext, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import user, { createUser } from "../redux/states/user";
import { enqueueSnackbar } from "notistack";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    authUser();
  }, []);

  const authUser = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (!token || !userData) {
      setLoading(false);
      return false;
    }
    //console.log(  "authoriced - " +  JSON.parse(userData).name +  " - role: " +   JSON.parse(userData).role );
    dispatch(createUser(JSON.parse(userData)));
    setAuth({ token: token, userData: JSON.parse(userData) });
    setLoading(false);
  };

  const setUserData = (data) => {
    localStorage.setItem("token", JSON.stringify(data.token));

    localStorage.setItem("userData", JSON.stringify(data));

    dispatch(createUser(data));
    setAuth({ token: data.token, userData: data });
  };

  const logout = () => {
    enqueueSnackbar("Logout successfully", { variant: "success" });
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setAuth({});
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
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
