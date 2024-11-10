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

export const getWebContent = () => {
  const controller = loadAbort();
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/webcontent", {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
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
      }),
    controller,
  };
};

export const getContent = () => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }

  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/content", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const getVideo = (id) => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/content/" + id, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        //notifyError(error);
      }),
    controller,
  };
};

export const searchVideos = (id, page) => {
  const controller = loadAbort();
  return {
    call: axios
      .get(
        `${import.meta.env.VITE_BASE_URL}/content-search/${id}?page=${page}`,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const getPendingPayments = () => {
  const controller = loadAbort();
  return {
    call: axios
      .get(
        import.meta.env.VITE_BASE_URL +
          "/payments?id=" +
          "66ce67d9a743bd281f1e804b",
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const getTheme = () => {
  const controller = loadAbort();
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/theme", {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const getCarousel = () => {
  const controller = loadAbort();
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/admin/carousel", {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const editCarousel = (data) => {
  const controller = loadAbort();
  return {
    call: axios
      .put(import.meta.env.VITE_BASE_URL + "/admin/carousel/", data, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const addCarousel = (data) => {
  const controller = loadAbort();
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/admin/carousel", data, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const deleteCarousel = (id) => {
  const controller = loadAbort();
  return {
    call: axios
      .delete(import.meta.env.VITE_BASE_URL + "/admin/carousel/" + id, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const getPayment = (id) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/payment/" + id, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const sendPayment = (formData) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/payments", formData, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const capturePaypalPayment = (orderID) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(
        import.meta.env.VITE_BASE_URL + `/payments/paypal/${orderID}/capture`,
        {},
        headers,
        {
          signal: controller.signal,
        }
      )
      .catch((error) => {
        notifyError(error);
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
