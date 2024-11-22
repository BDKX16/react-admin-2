import React, { createContext, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { getInitialDevices } from "../services/private";

const DevicesContext = createContext();

export const DevicesProvider = ({ children }) => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [devicesArr, setDevicesArr] = useState([]);
  const [reload, setReload] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState({});
  const { auth } = useAuth();
  const { closeSnackbar } = useSnackbar();

  useEffect(() => {
    getDevices();
  }, []);

  useEffect(() => {
    if (reload === true) {
      setTimeout(() => {
        getDevices();
        setReload(false);
      }, 500);
      setTimeout(() => {
        closeSnackbar();
      }, 3000);
    }
  }, [reload]);

  const getDevices = async () => {
    const result = await callEndpoint(getInitialDevices());

    if (!result || Object.keys(result)?.length === 0) {
      return;
    } else {
      setDevicesArr(result.data.data);
      setSelectedDevice(
        result.data.data.filter((device) => device.selected === true)[0]
      );
    }
  };

  const deviceContextValue = {
    setDevicesArr,
    devicesArr,
    selectedDevice,
    setReload,
    loading,
  };

  return (
    <DevicesContext.Provider value={deviceContextValue}>
      {children}
    </DevicesContext.Provider>
  );
};

export default DevicesContext;
