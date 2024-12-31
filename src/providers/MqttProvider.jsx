import React, { createContext, useEffect, useState, useRef } from "react";
import mqtt from "mqtt";
import { useSnackbar } from "notistack";
import useAuth from "../hooks/useAuth";
import axios from "axios";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import {
  getEmqxCredentials,
  getEmqxCredentialsReconnect,
} from "../services/private";

const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { auth } = useAuth();

  //mqtt client
  const mqttClientRef = useRef(null);

  //opciones de coneccion mqtt
  const [options, setOptions] = useState(null);

  //mensajes a enviar mqtt
  const [send, setSend] = useState({});

  //mensajes recibidos mqtt
  const [recived, setRecived] = useState([]);
  const [notifications, setNotifications] = useState([]);

  //cargando coneccion mqtt
  const [loadingMqtt, setLoadingMqtt] = useState(true);
  const [pestanaSegundoPlano, setPestanaSegundoPlano] = useState(false);
  const [connectingMqtt, setConnectingMqtt] = useState(false);

  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    try {
      window.addEventListener("visibilitychange", handleVisibilityChange);

      async function getCredentials() {
        await getMqttCredentials();
      }

      if (!connectingMqtt) {
        //getCredentials();
      }

      // Limpiar la conexión al desmontar el componente
      return () => {
        window.removeEventListener("visibilitychange", handleVisibilityChange);

        if (mqttClientRef.current) {
          mqttClientRef.current.end();
        }
      };
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Error al conectar al servicio mqtt", {
        variant: "error",
        persist: true,
      });
    }
  }, []);

  useEffect(() => {
    try {
      async function getCredentials() {
        await getMqttCredentials();
      }

      if (!connectingMqtt && auth.token) {
        getCredentials();
      }
    } catch (error) {
      console.log(error);
      enqueueSnackbar("Error al conectar al servicio mqtt", {
        variant: "error",
        persist: true,
      });
    }
  }, [auth.token]);

  useEffect(() => {
    async function init() {
      await initMqtt();
    }
    if (options != null && mqttClientRef.current == null) {
      const url =
        options.prefix + options.host + ":" + options.port + options.endpoint;

      const client = mqtt.connect(url, options);

      mqttClientRef.current = client;

      init();
    }
  }, [options]);

  useEffect(() => {
    if (
      send != null &&
      send.topic != null &&
      send.msg != null &&
      mqttClientRef.current
    ) {
      mqttClientRef.current.publish(send.topic, JSON.stringify(send.msg));
    } else {
      //console.log("error: message not sended");
    }
  }, [send]);

  const handleVisibilityChange = () => {
    if (document.visibilityState == "hidden") {
      // User came back to the page
      setPestanaSegundoPlano(true);
    } else {
      setPestanaSegundoPlano(false);
      // User switched tabs or left the page
    }
  };

  const initMqtt = async () => {
    const deviceSubscribeTopic = auth.userData.id + "/+/+/sdata";
    const notifSubscribeTopic = auth.userData.id + "/+/+/notif";
    console.log("connecting....");
    mqttClientRef.current.on("connect", function () {
      setConnectingMqtt(false);
      setLoadingMqtt(false);
      setReconnecting(false);
      console.log("Real time data connected");

      //SDATA SUBSCRIBE
      mqttClientRef.current.subscribe(
        deviceSubscribeTopic,
        { qos: 0 },
        (error) => {
          if (error) {
            console.error("Error en deviceSubscription", error);
          }
        }
      );

      //NOTIF SUBSCRIBE
      mqttClientRef.current.subscribe(
        notifSubscribeTopic,
        { qos: 0 },
        (error) => {
          if (error) {
            console.error("Error en notifSubscription", error);
          }
        }
      );
      closeSnackbar();
    });

    mqttClientRef.current.on("reconnect", (error) => {
      if (!connectingMqtt) {
        reconnectMqtt();
        //enqueueSnackbar("MQTT CONNECIONT FAIL, RECONNECTING -> ", { variant: "default" });
        setReconnecting(true);
      }
    });

    mqttClientRef.current.on("error", (error) => {
      //enqueueSnackbar("MQTT CONNECIONT FAIL -> ", { variant: "default" });
      setReconnecting(true);
      if (error.code == 5) {
        setConnectingMqtt(false);
      } else {
        if (
          mqttClientRef.current.disconnected == true &&
          mqttClientRef.current.reconnecting == false &&
          mqttClientRef.current.disconnecting == true
        ) {
          enqueueSnackbar("RECONECCION IMPOSIBLE, REINICIANDO -> ", {
            variant: "default",
          });
        }
      }
      console.log(error);
    });

    mqttClientRef.current.on("message", (topic, message) => {
      try {
        const splittedTopic = topic.split("/");
        const msgType = splittedTopic[3];
        if (msgType == "notif") {
          const valor = JSON.parse(message);
          const newItem = {
            value: valor.msg,
            topic: topic,
          };
          enqueueSnackbar(valor.msg, { variant: "default" });

          addNotification(newItem);

          return;
        } else if (msgType == "sdata") {
          const valor = JSON.parse(message);

          if (valor.value == null) {
            return;
          }
          const newItem = {
            variable: splittedTopic[2],
            dId: splittedTopic[1],
            value: valor.value,
            topic: topic,
          };

          const existingItem = recived.find(
            (item) => item.topic === newItem.topic
          );

          if (existingItem) {
            // Si existe, actualizar el valor del item existente
            const updatedItems = recived.map((item) =>
              item.topic === newItem.topic
                ? { ...item, value: newItem.value }
                : item
            );
            setRecived(updatedItems);
          } else {
            // Si no existe, agregar el nuevo item al estado
            setRecived([...recived, newItem]);
          }

          return;
        }
      } catch (error) {
        console.log(error);
        setConnectingMqtt(false);
      }
    });
  };

  const addNotification = (newNotification) => {
    setNotifications((prevNotifications) => {
      const updatedNotifications = [
        newNotification,
        ...prevNotifications.slice(0, 4),
      ];
      return updatedNotifications;
    });
  };

  const removeNotification = (index) => {
    setTimeout(() => {
      const updatedNotifications = notifications.filter((_, i) => i !== index);
      setNotifications(updatedNotifications);
    }, 300);
  };

  const getMqttCredentials = async () => {
    setConnectingMqtt(true);

    try {
      const res = await callEndpoint(getEmqxCredentials());

      if (
        res.data.status === "success" &&
        res.data.password !== undefined &&
        res.data.username !== undefined
      ) {
        let options = {
          prefix: import.meta.env.VITE_MQTT_PREFIX,
          port: import.meta.env.VITE_MQTT_PORT,
          host: import.meta.env.VITE_MQTT_HOST,
          endpoint: "/mqtt",
          clientId:
            "web_" +
            auth.userData.name +
            "_" +
            Math.floor(Math.random() * 1000000 + 1),
          username: res.data.username,
          password: res.data.password,
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 10000, // Increased from 5000 to 10000
        };
        setOptions(options);
        setConnectingMqtt(false);
      }
    } catch (error) {
      console.error("Error fetching MQTT credentials:", error);
      // Handle the error appropriately, e.g., set an error state
    }

    setConnectingMqtt(false);
  };

  const reconnectMqtt = async () => {
    if (!pestanaSegundoPlano) {
      setConnectingMqtt(true);

      const credentials = await callEndpoint(getEmqxCredentialsReconnect());
      console.log(credentials);
      if (credentials.data.status == "success") {
        mqttClientRef.current.options.password = credentials.data.password;
        mqttClientRef.current.options.username = credentials.data.username;
      }
    }
  };

  const mqttContextValue = {
    mqttClient: mqttClientRef.current,
    setSend,
    recived,
    notifications,
    removeNotification,
    loadingMqtt,
    reconnecting,
  };

  return (
    <MqttContext.Provider value={mqttContextValue}>
      {children}
    </MqttContext.Provider>
  );
};

export default MqttContext;
