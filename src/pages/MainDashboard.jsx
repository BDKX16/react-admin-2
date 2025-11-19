"use client";

import { useState, useEffect } from "react";
import UnifiedChartsSection from "@/components/dashboard/unified-charts-section";
import DeviceOverviewGrid from "@/components/dashboard/device-overview-grid";
import {
  OTAUpdateModal,
  shouldShowOTAModal,
} from "@/components/ota/OTAUpdateModal";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import {
  getAllDevicesOTAStatus,
  triggerDeviceOTAUpdate,
  cancelDeviceOTAUpdate,
} from "../services/private";
import useDevices from "../hooks/useDevices";

export default function DashboardPage() {
  const { devicesArr } = useDevices();
  const [timeRange] = useState("24h");
  const [otaModalOpen, setOtaModalOpen] = useState(false);
  const [allDevicesOTA, setAllDevicesOTA] = useState(null);
  const [selectedOTADevice, setSelectedOTADevice] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { callEndpoint } = useFetchAndLoad();

  const loadAllDevicesOTA = async () => {
    try {
      const response = await callEndpoint(getAllDevicesOTAStatus());
      if (!response.error && response.data) {
        setAllDevicesOTA(response.data);

        // Solo mostrar modal si no está ya abierto
        if (
          !otaModalOpen &&
          response.data.devices &&
          Array.isArray(response.data.devices)
        ) {
          // Filtrar dispositivos que necesitan mostrar actualización
          const devicesNeedingUpdate = response.data.devices.filter((d) =>
            shouldShowOTAModal(d)
          );

          if (devicesNeedingUpdate.length > 0) {
            // Priorizar actualizaciones críticas
            const criticalUpdate = devicesNeedingUpdate.find(
              (d) => d.availableFirmware?.isCritical
            );

            // Mostrar crítica si existe, sino la primera disponible
            const deviceToShow = criticalUpdate || devicesNeedingUpdate[0];

            setSelectedOTADevice(deviceToShow);
            setOtaModalOpen(true);

            // Log para debugging
            console.log(
              `📡 OTA Update available for device: ${
                deviceToShow.dId
              } - Version: ${deviceToShow.availableFirmware?.version}${
                deviceToShow.availableFirmware?.isCritical ? " (CRITICAL)" : ""
              }`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error loading OTA status:", error);
    }
  };

  // Cargar estado OTA al montar el componente
  useEffect(() => {
    loadAllDevicesOTA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOTAUpdateComplete = async () => {
    // Recargar estado OTA después de actualización exitosa
    await loadAllDevicesOTA();
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <DeviceOverviewGrid devices={devicesArr} />

        <UnifiedChartsSection timeRange={timeRange} />
      </div>

      {/* Modal de actualizaciones OTA */}
      {selectedOTADevice && (
        <OTAUpdateModal
          open={otaModalOpen}
          onClose={() => setOtaModalOpen(false)}
          otaStatus={selectedOTADevice}
          onUpdate={handleOTAUpdateComplete}
        />
      )}
    </main>
  );
}
