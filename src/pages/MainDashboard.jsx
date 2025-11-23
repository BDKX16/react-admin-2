"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import UnifiedChartsSection from "@/components/dashboard/unified-charts-section";
import DeviceOverviewGrid from "@/components/dashboard/device-overview-grid";
import { OTABulkUpdateModal } from "@/components/ota/OTABulkUpdateModal";
import { useWelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useWelcomeModalContext } from "../contexts/WelcomeModalContext";
import useFetchAndLoad from "../hooks/useFetchAndLoad";

// Lazy load del modal de bienvenida (tiene video pesado)
const WelcomeModal = lazy(() =>
  import("@/components/onboarding/WelcomeModal").then((module) => ({
    default: module.WelcomeModal,
  }))
);
import { getDevicesOTAStatus } from "../services/private";
import useDevices from "../hooks/useDevices";
import useMqtt from "../hooks/useMqtt";
import useAuth from "../hooks/useAuth";

export default function DashboardPage() {
  const { devicesArr } = useDevices();
  const { recived, mqttStatus, setSend } = useMqtt();
  const { auth } = useAuth();
  const [timeRange] = useState("24h");
  const [otaModalOpen, setOtaModalOpen] = useState(false);
  const [otaDevicesData, setOtaDevicesData] = useState([]);
  const [otaStatusCache, setOtaStatusCache] = useState(null);
  const [isFetchingStatus, setIsFetchingStatus] = useState(false);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const [updateRequestSent, setUpdateRequestSent] = useState(false);
  const { callEndpoint } = useFetchAndLoad();

  // Welcome modal (para usuarios que acaban de completar el onboarding)
  const { showModal: showWelcomeModalAuto } = useWelcomeModal();

  // Contexto compartido para abrir el modal desde el menu
  const { showWelcomeModal, setShowWelcomeModal } = useWelcomeModalContext();

  // Sincronizar el auto-show con el contexto
  useEffect(() => {
    if (showWelcomeModalAuto) {
      setShowWelcomeModal(true);
    }
  }, [showWelcomeModalAuto, setShowWelcomeModal]);

  // El tour inicial solo se activa desde el modal de bienvenida
  // No hay auto-inicio del tour aquí

  // Enviar solicitud de actualización a todos los dispositivos cuando MQTT esté online
  useEffect(() => {
    if (
      mqttStatus === "online" &&
      devicesArr.length > 0 &&
      !updateRequestSent
    ) {
      devicesArr.forEach((device) => {
        const toSend = {
          topic: auth.userData.id + "/" + device.dId + "/updater/actdata",
          msg: {
            value: true,
          },
        };
        setSend({ msg: toSend.msg, topic: toSend.topic });
      });
      setUpdateRequestSent(true);
    }
  }, [mqttStatus, devicesArr, auth.userData?.id, setSend, updateRequestSent]);

  const shouldShowOTAModal = () => {
    // No mostrar si el modal de bienvenida está activo
    if (showWelcomeModal) {
      return false;
    }

    const hideUntil = localStorage.getItem("ota_modal_hide_until");
    if (hideUntil) {
      try {
        const hideTimestamp = parseInt(hideUntil, 10);
        const now = Date.now();
        if (now < hideTimestamp) {
          return false; // No mostrar si aún está dentro del período de ocultación
        } else {
          // Limpiar si ya pasó el período
          localStorage.removeItem("ota_modal_hide_until");
        }
      } catch {
        // Si hay error parseando, limpiar el valor corrupto
        localStorage.removeItem("ota_modal_hide_until");
      }
    }
    return true;
  };

  const checkForUpdates = async () => {
    // No verificar si ya se chequeó una vez, si está en proceso, o si el usuario ocultó el modal
    if (hasCheckedOnce || isFetchingStatus || !shouldShowOTAModal()) {
      return;
    }

    try {
      // Si ya tenemos el cache, usar esos datos
      let statusData = otaStatusCache;

      // Solo llamar al endpoint si no tenemos cache
      if (!statusData) {
        setIsFetchingStatus(true); // Marcar que está en proceso
        const response = await callEndpoint(getDevicesOTAStatus());
        if (!response.error && response.data?.data?.devices) {
          statusData = response.data.data.devices;
          setOtaStatusCache(statusData); // Guardar en cache
        }
        setIsFetchingStatus(false); // Marcar que terminó
      }

      if (statusData) {
        // Crear set de dispositivos que están enviando mensajes (online)
        const onlineDevicesSet = new Set(recived.map((msg) => msg.dId));

        // Filtrar dispositivos con actualizaciones disponibles o críticas, sin ongoing updates y que estén online
        const devicesWithUpdates = statusData.filter(
          (device) =>
            (device.updateAvailable || device.criticalUpdate) &&
            !device.ongoingUpdate &&
            onlineDevicesSet.has(device.dId)
        );

        // Si hay dispositivos con actualizaciones, mostrar el modal
        if (devicesWithUpdates.length > 0) {
          setOtaDevicesData(devicesWithUpdates);
          setOtaModalOpen(true);
          setHasCheckedOnce(true); // Marcar que ya se verificó
        } else {
          // No hay dispositivos online con actualizaciones, marcar como chequeado para no reintentar
          setHasCheckedOnce(true);
        }
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      setIsFetchingStatus(false);
    }
  };

  const handleCloseModal = (hideFor7Days = false) => {
    const hideUntil = new Date();
    if (hideFor7Days) {
      // Ocultar por 7 días
      hideUntil.setDate(hideUntil.getDate() + 7);
    } else {
      // Ocultar por 1 día (hasta mañana 00:00)
      hideUntil.setDate(hideUntil.getDate() + 1);
    }
    hideUntil.setHours(0, 0, 0, 0);

    // Guardar como timestamp numérico (consistente con OTAUpdateStep)
    localStorage.setItem(
      "ota_modal_hide_until",
      hideUntil.getTime().toString()
    );
    setOtaModalOpen(false);
  };

  // Verificar actualizaciones cuando lleguen mensajes MQTT
  useEffect(() => {
    // Solo verificar si hay mensajes recibidos y no se ha chequeado aún
    if (recived.length > 0 && !hasCheckedOnce) {
      checkForUpdates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recived]);

  return (
    <main className="min-h-screen bg-background" data-tour="main-dashboard">
      <div
        className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6"
        data-tour="main-content"
      >
        <div data-tour="device-grid">
          <DeviceOverviewGrid devices={devicesArr} />
        </div>

        <UnifiedChartsSection timeRange={timeRange} />
      </div>

      {/* Modal de actualizaciones OTA masivas */}
      <OTABulkUpdateModal
        open={otaModalOpen}
        onClose={handleCloseModal}
        devicesData={otaDevicesData}
      />

      {/* Modal de bienvenida (lazy-loaded, solo se carga cuando se muestra) */}
      {showWelcomeModal && (
        <Suspense fallback={null}>
          <WelcomeModal
            open={showWelcomeModal}
            onOpenChange={setShowWelcomeModal}
          />
        </Suspense>
      )}
    </main>
  );
}
