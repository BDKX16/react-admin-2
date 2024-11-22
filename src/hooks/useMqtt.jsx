import React from "react";
import { useContext } from "react";
import MqttContext from "../providers/MqttProvider";

const useMqtt = () => {
  return useContext(MqttContext);
};

export default useMqtt;
