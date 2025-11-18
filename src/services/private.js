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

export const getChartData = (dId, timeRange = "1day", variables = null) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  // Construir parámetros
  const params = { dId, timeRange };
  if (variables && variables.length > 0) {
    params.variables = Array.isArray(variables)
      ? variables.join(",")
      : variables;
  }

  headers.params = params;

  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/chart-data", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const getMultiDeviceChartData = (variables, timeRange = "24h") => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  // Convertir array de variables a string separado por comas
  const variablesParam = Array.isArray(variables)
    ? variables.join(",")
    : variables;

  headers.params = { variables: variablesParam, timeRange };

  return {
    call: axios
      .get(
        import.meta.env.VITE_BASE_URL + "/multi-device-chart-data",
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
        // No mostrar error para throttling (429), es comportamiento esperado
        if (error.response?.status !== 429) {
          notifyError(error);
        }
        return { error: true, response: error.response };
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

export const getRecentEvents = (limit = 10) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  headers.params = { limit };

  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/recent-events", headers, {
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
 * SUBSCRIPTIONS & PAYMENTS
 ************/

// User subscription status endpoint
export const getSubscriptionStatus = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/subscription-status", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

// SUBSCRIPTION ENDPOINTS (/subscriptions)

// GET /subscriptions/current - Obtener subscripción activa del usuario
export const getCurrentSubscription = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/subscriptions/current", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

// POST /subscriptions/create - Crear nueva subscripción al plan PRO
export const createSubscription = (planType = "pro") => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/subscriptions/create",
        { planType },
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

// PUT /subscriptions/cancel - Cancelar subscripción activa
export const cancelSubscription = (reason) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + "/subscriptions/cancel",
        { reason },
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

// GET /subscriptions/history - Historial de subscripciones del usuario
export const getSubscriptionHistory = (page = 1, limit = 10) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  headers.params = { page, limit };
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/subscriptions/history", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

// PAYMENT ENDPOINTS (/payments)

// GET /payments/history - Historial de pagos del usuario
export const getPaymentHistory = (page = 1, limit = 10) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  headers.params = { page, limit };
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/payments/history", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

// GET /payments/:paymentId - Detalles de un pago específico
export const getPaymentDetails = (paymentId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + `/payments/${paymentId}`, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

// POST /payments/create-preference/:paymentId - Crear preferencia de pago en MercadoPago
export const createPaymentPreference = (paymentId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL +
          `/payments/create-preference/${paymentId}`,
        {},
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

// POST /payments/manual-approval/:paymentId - Aprobar pago manualmente (admin/testing)
export const manualApprovePayment = (paymentId, adminNote) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL +
          `/payments/manual-approval/${paymentId}`,
        { adminNote },
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

// USER PROFILE ENDPOINTS (/users)

// PUT /users/update-profile - Actualizar nombre y/o email del usuario
export const updateUserProfile = (profileData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + "/users/update-profile",
        profileData,
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

// GET /users/profile - Obtener información completa del perfil del usuario
export const getUserProfile = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/users/profile", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

// DELETE /users/cancel-email-change - Cancelar cambio de email pendiente
export const cancelEmailChange = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + "/users/cancel-email-change",
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

// LEGACY ENDPOINTS (mantener compatibilidad)
export const getUserSubscription = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/subscription", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const updateSubscription = (subscriptionData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + "/subscription",
        subscriptionData,
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

export const getUserPayments = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/payments", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const createPayment = (paymentData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/payments", paymentData, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

/**********
 * GOOGLE AUTH
 ************/

// GET /users/auth/status - Get authentication status
export const getAuthStatus = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/auth/status", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

// DELETE /users/auth/google/unlink - Unlink Google account
export const unlinkGoogleAccount = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(import.meta.env.VITE_BASE_URL + "/auth/google/unlink", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

/**********
 * OTA UPDATES
 ************/

export const getDeviceOTAStatus = (dId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(
        import.meta.env.VITE_BASE_URL + `/device/${dId}/ota/status`,
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

export const getAllDevicesOTAStatus = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/devices/ota/status", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const triggerDeviceOTAUpdate = (dId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + `/device/${dId}/ota/update`,
        {},
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

export const cancelDeviceOTAUpdate = (dId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + `/device/${dId}/ota/update`,
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
