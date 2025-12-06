import axios from "axios";
import store from "../redux/store";

// Función para obtener headers con autenticación
const getAxiosHeaders = () => {
  const state = store.getState();
  return {
    headers: {
      token: state.user.token,
      "Content-Type": "application/json",
    },
  };
};

// Base URL de la API
const API_BASE_URL =
  import.meta.env.VITE_BASE_URL || "http://localhost:3001/api";

/**
 * Servicios para gestión de workflows visuales
 */

/**
 * Guardar workflow visual (crear o actualizar)
 * @param {Object} workflowData - Datos del workflow
 * @param {string} workflowData.id - ID del workflow (opcional para crear nuevo)
 * @param {string} workflowData.name - Nombre del workflow
 * @param {string} workflowData.description - Descripción del workflow
 * @param {Array} workflowData.nodes - Nodos del workflow
 * @param {Array} workflowData.edges - Conexiones del workflow
 * @param {Object} workflowData.viewport - Estado del viewport (zoom, posición)
 * @param {boolean} workflowData.enabled - Estado habilitado/deshabilitado
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const saveWorkflow = async (workflowData) => {
  try {
    // Preparar datos para enviar al backend
    const payload = {
      name: workflowData.name,
      description: workflowData.description,
      nodes: workflowData.nodes,
      edges: workflowData.edges,
      viewport: workflowData.viewport || { x: 0, y: 0, zoom: 1 },
      enabled: workflowData.enabled,
      deviceId: workflowData.deviceId, // Agregar deviceId
    };

    let response;

    // Si hay ID, hacer PUT (actualizar), sino POST (crear)
    if (workflowData.id) {
      response = await axios.put(
        `${API_BASE_URL}/node/workflow/${workflowData.id}`,
        payload,
        getAxiosHeaders()
      );
    } else {
      response = await axios.post(
        `${API_BASE_URL}/node/rules/workflow`,
        payload,
        getAxiosHeaders()
      );
    }

    return response.data;
  } catch (error) {
    console.error("Error guardando workflow:", error);
    throw error;
  }
};

/**
 * Obtener workflow visual por ID
 * @param {string} workflowId - ID del workflow
 * @returns {Promise<Object>} Datos del workflow
 */
export const getWorkflow = async (workflowId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/node/rules/workflow/${workflowId}`,
      getAxiosHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error obteniendo workflow:", error);
    throw error;
  }
};

/**
 * Obtener lista de workflows del dispositivo seleccionado
 * @param {string} deviceId - ID del dispositivo (opcional)
 * @returns {Promise<Object>} Lista de workflows
 */
export const getWorkflows = async (deviceId = null) => {
  try {
    let url = `${API_BASE_URL}/node/workflows`;

    // Agregar deviceId como query param si se proporciona
    if (deviceId) {
      url += `?deviceId=${deviceId}`;
    }

    const response = await axios.get(url, getAxiosHeaders());

    return {
      success: true,
      data: response.data.data || [],
    };
  } catch (error) {
    console.error("Error obteniendo workflows:", error);
    throw error;
  }
};

/**
 * Eliminar workflow visual
 * @param {string} workflowId - ID del workflow
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const deleteWorkflow = async (workflowId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/node/workflow/${workflowId}`,
      getAxiosHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error eliminando workflow:", error);
    throw error;
  }
};

/**
 * Alternar estado habilitado/deshabilitado del workflow
 * @param {string} workflowId - ID del workflow
 * @param {boolean} enabled - Estado deseado
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const toggleWorkflow = async (workflowId, enabled) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/node/rules/workflow/${workflowId}/toggle`,
      { enabled },
      getAxiosHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error cambiando estado del workflow:", error);
    throw error;
  }
};
