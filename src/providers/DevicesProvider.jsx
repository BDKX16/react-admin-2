import React, { createContext, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { getInitialDevices } from "../services/private";
import useMqtt from "../hooks/useMqtt";

const DevicesContext = createContext();

export const DevicesProvider = ({ children }) => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [devicesArr, setDevicesArr] = useState([]);
  const [reload, setReload] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState({});
  const { auth } = useAuth();
  const { closeSnackbar } = useSnackbar();

  const { mqttStatus, setSend } = useMqtt();

  useEffect(() => {
    getDevices();
  }, []);

  useEffect(() => {
    if (mqttStatus === "online") {
      //return;
      const toSend = {
        topic: auth.userData.id + "/" + selectedDevice.dId + "/updater/actdata",
        msg: {
          value: true,
        },
      };

      setSend({ msg: toSend.msg, topic: toSend.topic });
    }
  }, [mqttStatus]);

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

    if (!result || Object.keys(result)?.length === 0 || result.error) {
      return;
    } else {
      setDevicesArr(result.data.data);
      setSelectedDevice(
        result.data.data.filter((device) => device.selected === true)[0]
      );
      console.log("Selected Device");
    }
  };

  const deviceContextValue = {
    setDevicesArr,
    devicesArr,
    selectedDevice:
      Object.keys(selectedDevice).length > 0 ? selectedDevice : null,
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
