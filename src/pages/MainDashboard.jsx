"use client";

import { useState, useEffect } from "react";
// import UnifiedChartsSection from "@/components/dashboard/unified-charts-section";
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
  // const [timeRange] = useState("24h");
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

        // Si hay algún dispositivo con actualización disponible, mostrar modal
        const deviceWithUpdate = response.data.devices.find((d) =>
          shouldShowOTAModal(d)
        );

        if (deviceWithUpdate) {
          setSelectedOTADevice(deviceWithUpdate);
          setOtaModalOpen(true);
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

  const handleOTAUpdate = async () => {
    if (!selectedOTADevice) return;

    setIsUpdating(true);
    try {
      const response = await callEndpoint(
        triggerDeviceOTAUpdate(selectedOTADevice.dId)
      );
      if (!response.error) {
        // Recargar estado OTA después de iniciar la actualización
        await loadAllDevicesOTA();
      }
    } catch (error) {
      console.error("Error triggering OTA update:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOTACancel = async () => {
    if (!selectedOTADevice) return;

    try {
      const response = await callEndpoint(
        cancelDeviceOTAUpdate(selectedOTADevice.dId)
      );
      if (!response.error) {
        await loadAllDevicesOTA();
        setOtaModalOpen(false);
      }
    } catch (error) {
      console.error("Error cancelling OTA update:", error);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <DeviceOverviewGrid devices={devicesArr} />

        {/* <UnifiedChartsSection timeRange={timeRange} /> */}
      </div>

      {/* Modal de actualizaciones OTA */}
      {selectedOTADevice && (
        <OTAUpdateModal
          open={otaModalOpen}
          onClose={() => setOtaModalOpen(false)}
          otaStatus={selectedOTADevice}
          onUpdate={handleOTAUpdate}
          onCancel={handleOTACancel}
          isUpdating={isUpdating}
        />
      )}
    </main>
  );
}
