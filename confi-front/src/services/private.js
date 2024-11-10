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
      }),
    controller,
  };
};

export const editContent = (data) => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(import.meta.env.VITE_BASE_URL + "/admin/content", data, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const deleteContent = (id) => {
  const controller = loadAbort();

  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(import.meta.env.VITE_BASE_URL + "/admin/content/" + id, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const contentState = (id, status) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + "/admin/content-state/",
        { id, status },
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
 * USERS
 ************/

export const getUsers = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/admin/users", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const getUser = (id) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/admin/user/" + id, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const editUser = (role = null, nullDate = null) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + "/admin/user/" + id,
        { role, nullDate },
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

export const deleteUser = (id) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(import.meta.env.VITE_BASE_URL + "/admin/user/" + id, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

/**********
 * THEMES
 ************/

export const addTheme = (data) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/admin/theme", data, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const editTheme = (data) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(import.meta.env.VITE_BASE_URL + "/admin/theme", data, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const deleteTheme = (id) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(import.meta.env.VITE_BASE_URL + "/admin/theme/" + id, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

/**********
 * CATEGORIES
 ************/

export const getCategorys = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/admin/categorys", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const addCategory = (data) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/admin/category", data, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const editCategory = (data) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(import.meta.env.VITE_BASE_URL + "/admin/category", data, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const deleteCategory = (id) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + "/admin/category/" + id,
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
 * CAROUSELS
 ************/

export const getCarousels = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/admin/carousels", headers, {
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
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/admin/carousel", data, headers, {
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
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(import.meta.env.VITE_BASE_URL + "/admin/carousel", data, headers, {
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
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + "/admin/carousel/" + id,
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
 * TEMPLATES
 ************/

export const getTemplates = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/templates", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const getTemplate = (id) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios.get(
      import.meta.env.VITE_BASE_URL + "/template/" + id,
      headers,
      {
        signal: controller.signal,
      }
    ),
    controller,
  };
};

export const addTemplate = (data) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .post(import.meta.env.VITE_BASE_URL + "/admin/template", data, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const editTemplate = (id, data) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(import.meta.env.VITE_BASE_URL + "/admin/template", data, headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const selectTemplate = (id, active) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + "/admin/template/" + id,
        { active },
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

export const deleteTemplate = (id) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(
        import.meta.env.VITE_BASE_URL + "/admin/template/" + id,
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
 * PAYMENTS
 ************/

export const getPayments = () => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .get(import.meta.env.VITE_BASE_URL + "/admin/payments", headers, {
        signal: controller.signal,
      })
      .catch((error) => {
        notifyError(error);
      }),
    controller,
  };
};

export const editPayment = (status = null) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .put(
        import.meta.env.VITE_BASE_URL + "/admin/payment/" + id,
        { status },
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

export const deletePayment = (id) => {
  const controller = loadAbort();
  const headers = getAxiosHeaders();
  if (!headers) {
    return;
  }
  return {
    call: axios
      .delete(import.meta.env.VITE_BASE_URL + "/admin/payment/" + id, headers, {
        signal: controller.signal,
      })
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
