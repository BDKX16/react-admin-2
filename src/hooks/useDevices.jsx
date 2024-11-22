import React from "react";
import { useContext } from "react";
import DevicesContext from "../providers/DevicesProvider";

const useDevices = () => {
  return useContext(DevicesContext);
};

export default useDevices;
