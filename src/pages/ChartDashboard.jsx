import React, { useEffect } from "react";
import Chart from "@/components/Chart";
import useDevices from "@/hooks/useDevices";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { chartsTour } from "@/config/tours";

const ChartDashboard = () => {
  const { selectedDevice } = useDevices();
  const { startTour, hasCompletedOnboarding } = useOnboarding();

  // Auto-start charts tour on first visit
  useEffect(() => {
    if (!hasCompletedOnboarding("analytics") && selectedDevice) {
      const timer = setTimeout(() => {
        startTour("analytics", chartsTour);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, startTour, selectedDevice]);

  return (
    <div className="p-2 md:p-4">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min overflow-hidden">
        {selectedDevice && <Chart device={selectedDevice} />}
      </div>
    </div>
  );
};

export default ChartDashboard;
