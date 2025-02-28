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
        return { error: true, code: error?.response?.data?.code };
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

export const getMobileDevices = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/mobiledata", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const deleteMobileDevice = (deviceId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + `/mobiledata?id=${deviceId}`,
        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const getNotifications = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/notifications", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const addNotificationAlert = (alertData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/notification-alert",
        alertData,
        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const updateUserNotificationsStatus = (status) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + `/user-notifications`,
        { status: status },
        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const updateNotificationAlert = (rule) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  rule.status = !rule.status;
  const toSend = {
    rule: rule,
  };

  return {
    call: axios
      .put(import.meta.env.VITE_BASE_URL + `/alarm-rule`, toSend, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const deleteNotificationAlert = (rule) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + `/alarm-rule?emqxRuleId`,
        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const setNotificationRead = (notificationId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  const toSend = {
    notifId: notificationId,
  };
  return {
    call: axios
      .put(import.meta.env.VITE_BASE_URL + `/notifications`, toSend, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const setAllNotificationsRead = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + "/notifications",

        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const getSchedules = (dId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/schedules/?dId=" + dId, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const checkSchedule = (schedule) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + `/schedule-check`,
        { schedule },
        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const deleteSchedule = (id) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + `/schedule?scheduleId=${id}`,

        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const updateDeviceConfig = (deviceData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + `/device-config`,
        deviceData,
        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const updateSaverRule = (ruleId, ruleData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + `/saver-rule/${ruleId}`,
        ruleData,
        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const deleteDevice = (dId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/device/?dId=" + dId, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const addDeviceSchedule = (scheduleData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + `/schedule`,
        scheduleData,
        headers,
        {
          signal: controller.signal,
        }
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
  //console.log(error);
  if (error.status === 401) {
    enqueueSnackbar("No autorizado", {
      variant: "error",
    });
  } else if (error.status !== 200) {
    enqueueSnackbar(error.response.statusText, {
      variant: "error",
    });
  }
};
