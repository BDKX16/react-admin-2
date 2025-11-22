"use client";

import { useState, useEffect } from "react";
import UnifiedChartsSection from "@/components/dashboard/unified-charts-section";
import DeviceOverviewGrid from "@/components/dashboard/device-overview-grid";
import { OTABulkUpdateModal } from "@/components/ota/OTABulkUpdateModal";
import { TourTrigger } from "@/components/onboarding/TourTrigger";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { getDevicesOTAStatus } from "../services/private";
import useDevices from "../hooks/useDevices";
import useMqtt from "../hooks/useMqtt";
import useAuth from "../hooks/useAuth";
import { useOnboarding } from "../contexts/OnboardingContext";
import { initialTour } from "../config/tours";

export default function DashboardPage() {
  const { devicesArr } = useDevices();
  const { recived, mqttStatus, setSend } = useMqtt();
  const { auth } = useAuth();
  const { hasCompletedOnboarding, startTour } = useOnboarding();
  const [timeRange] = useState("24h");
  const [otaModalOpen, setOtaModalOpen] = useState(false);
  const [otaDevicesData, setOtaDevicesData] = useState([]);
  const [otaStatusCache, setOtaStatusCache] = useState(null);
  const [isFetchingStatus, setIsFetchingStatus] = useState(false);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const [updateRequestSent, setUpdateRequestSent] = useState(false);
  const { callEndpoint } = useFetchAndLoad();

  // Check for initial onboarding
  useEffect(() => {
    if (!hasCompletedOnboarding("inicio")) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startTour("initial", initialTour);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, startTour]);

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
    const hideUntil = localStorage.getItem("ota_modal_hide_until");
    if (hideUntil) {
      const hideDate = new Date(hideUntil);
      const now = new Date();
      if (now < hideDate) {
        return false; // No mostrar si aún está dentro del período de ocultación
      } else {
        // Limpiar si ya pasó el período
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
      // Ocultar por 1 día (hasta el final del día actual)
      hideUntil.setHours(23, 59, 59, 999);
    }
    localStorage.setItem("ota_modal_hide_until", hideUntil.toISOString());
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

      {/* Tour trigger button */}
      <TourTrigger />
    </main>
  );
}
