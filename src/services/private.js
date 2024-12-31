import { loadAbort } from "@/utils/load-abort-controller";
import axios from "axios";
import store from "../redux/store";
//import { useSelector } from "react-redux";

import { enqueueSnackbar } from "notistack";

const getAxiosHeaders = () => {
  //const userState = useSelector((store) => store.user);
  const state = store.getState();
  //const token = state.userState.token;
  if (!state.user.token) {
    return null;
  }
  return {
    headers: {
      token: state.user.token,
      "Content-Type": "application/json",
    },
  };
};

/**********
 * CHARTS
 ************/

export const getChartsData = (dId, variable, chartTimeAgo) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  headers.params = { dId, chartTimeAgo, variable };
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/get-small-charts-data", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const getDayChartsData = (dId, variable, day) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  headers.params = { dId, variable, day };
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/get-day-charts-data", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const getInitialDevices = () => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/device", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const getEmqxCredentials = () => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/getmqttcredentials",
        {},
        headers,
        { signal: controller.signal }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const getEmqxCredentialsReconnect = () => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/getmqttcredentialsforreconnection",
        {},
        headers,
        { signal: controller.signal }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

/**********
 * FUNCTIONS
 ************/

const notifyError = (error) => {
  console.log("error");
  if (error.status === 401) {
    enqueueSnackbar("No autorizado", {
      variant: "error",
    });
  } else if (error.status !== 200) {
    enqueueSnackbar(error.response.data.error.message, {
      variant: "error",
    });
  }
};
