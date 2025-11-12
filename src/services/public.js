import { loadAbort } from "@/utils/load-abort-controller";
import axios from "axios";
import store from "../redux/store";
//import { useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";

const getAxiosHeaders = () => {
  //const userState = useSelector((store) => store.user);
  const state = store.getState();
  //const token = state.userState.token;
  return {
    headers: {
      token: state.user.token,
      "Content-Type": "application/json",
    },
  };
};

export const login = (username, password) => {
  const controller = loadAbort();
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/login",
        { email: username, password },
        { signal: controller.signal }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const register = (name, username, password) => {
  const controller = loadAbort();
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/register",
        { name: name, email: username, password: password },
        { signal: controller.signal }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const selectDevice = (dId) => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(`${import.meta.env.VITE_BASE_URL}/device`, { dId }, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const setSingleTimer = (timer, dId) => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(`${import.meta.env.VITE_BASE_URL}/timer`, { timer, dId }, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const setSingleCicle = (cicle, dId) => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(`${import.meta.env.VITE_BASE_URL}/cicle`, { cicle, dId }, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const newDevice = (serial, name) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/device",
        {
          newDevice: {
            dId: serial,
            name: name,
          },
        },
        headers,
        { signal: controller.signal }
      )
      .catch((error) => {
        enqueueSnackbar(error.response.data.error, {
          variant: "error",
        });
        return { error: true, message: error.response.data.error };
      }),
    controller,
  };
};

export const createRule = (alarmRule) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/alarm-rule", alarmRule, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const updateRule = (rule) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + "/edit-automatization",
        { newRule: rule },
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

export const deleteRule = (ruleId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + "/alarm-rule?emqxRuleId=" + ruleId,
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

export const getRule = (ruleId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/alarm-rule/" + ruleId, {
        ...headers,
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

// Servicios para reglas compuestas
export const getCompositeRule = (ruleId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/node/rules/" + ruleId, {
        ...headers,
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const createCompositeRule = (ruleData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/node/rules/automation",
        ruleData,
        {
          ...headers,
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

export const updateCompositeRule = (ruleId, ruleData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .put(import.meta.env.VITE_BASE_URL + "/node/rules/" + ruleId, ruleData, {
        ...headers,
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const deleteCompositeRule = (ruleId) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .delete(import.meta.env.VITE_BASE_URL + "/node/rules/" + ruleId, {
        ...headers,
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const getAllCompositeRules = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/node/rules", {
        ...headers,
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

// PUBLIC ENDPOINTS FOR PAYMENTS AND EMAIL CONFIRMATION

// POST /payments/webhook - Webhook para notificaciones de MercadoPago (PUBLIC)
export const paymentsWebhook = (webhookData) => {
  const controller = loadAbort();
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/payments/webhook", webhookData, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .catch((error) => {
        console.error("Webhook error:", error);
        return { error: true };
      }),
    controller,
  };
};

// POST /users/confirm-email-change - Confirmar cambio de email con token (PUBLIC)
export const confirmEmailChange = (token, newEmail) => {
  const controller = loadAbort();
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/users/confirm-email-change",
        { token, newEmail },
        {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .catch((error) => {
        notifyError(error);
        return { error: true };
      }),
    controller,
  };
};

export const updateDeviceLocation = (dId, locationData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        `${import.meta.env.VITE_BASE_URL}/device/${dId}/location`,
        locationData,
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

export const loginWithGoogle = (idToken) => {
  const controller = loadAbort();
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + "/auth/google",
        { credential: idToken },
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
