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
