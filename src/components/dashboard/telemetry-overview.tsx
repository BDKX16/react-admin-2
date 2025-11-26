"use client";

import { TrendingUp, Droplets, Wind, Zap, Leaf, CloudRain } from "lucide-react";
import TelemetryCard from "./telemetry-card";
import useDevices from "@/hooks/useDevices";
import { useMemo } from "react";

// Calcular VPD (Vapor Pressure Deficit)
const calculateVPD = (temp: number, humidity: number): number => {
  const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  const avp = svp * (humidity / 100);
  const vpd = svp - avp;
  return Number(vpd.toFixed(2));
};

// Calcular Dew Point (Punto de Rocío)
const calculateDewPoint = (temp: number, humidity: number): number => {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Number(dewPoint.toFixed(1));
};

export default function TelemetryOverview() {
  const { devices } = useDevices();

  // Calcular promedios y VPD/Dew Point
  const telemetryStats = useMemo(() => {
    const confiDevices = devices.filter((d) => d.template?.model !== "tecmat");
    const hasConfiDevices = confiDevices.length > 0;

    let totalTemp = 0;
    let totalHum = 0;
    let tempCount = 0;
    let humCount = 0;

    devices.forEach((device) => {
      if (device.savelogs && device.savelogs.length > 0) {
        const latestLog = device.savelogs[0];
        if (latestLog.temp !== undefined && latestLog.temp > 0) {
          totalTemp += latestLog.temp;
          tempCount++;
        }
        if (latestLog.hum !== undefined && latestLog.hum > 0) {
          totalHum += latestLog.hum;
          humCount++;
        }
      }
    });

    const avgTemp = tempCount > 0 ? totalTemp / tempCount : 22.8;
    const avgHum = humCount > 0 ? totalHum / humCount : 65;
    const vpd = calculateVPD(avgTemp, avgHum);
    const dewPoint = calculateDewPoint(avgTemp, avgHum);

    return {
      avgTemp: avgTemp.toFixed(1),
      avgHum: avgHum.toFixed(0),
      vpd,
      dewPoint,
      hasConfiDevices,
      deviceCount: devices.length,
    };
  }, [devices]);

  const telemetryData = [
    {
      label: "Temperatura Promedio",
      value: telemetryStats.avgTemp,
      unit: "°C",
      range: "20-25°C",
      icon: Zap,
      trend: "up" as const,
      color: "chart-1",
      devices: telemetryStats.deviceCount,
    },
    {
      label: "Humedad Ambiente",
      value: telemetryStats.avgHum,
      unit: "%",
      range: "50-70%",
      icon: Droplets,
      trend: "stable" as const,
      color: "chart-2",
      devices: telemetryStats.deviceCount,
    },
    ...(telemetryStats.hasConfiDevices
      ? [
          {
            label: "VPD",
            value: telemetryStats.vpd.toString(),
            unit: "kPa",
            range: "0.8-1.2 kPa",
            icon: Leaf,
            trend: "stable" as const,
            color: "chart-5",
            devices: telemetryStats.deviceCount,
          },
          {
            label: "Punto de Rocío",
            value: telemetryStats.dewPoint.toString(),
            unit: "°C",
            range: "Monitoreo",
            icon: CloudRain,
            trend: "stable" as const,
            color: "chart-6",
            devices: telemetryStats.deviceCount,
          },
        ]
      : []),
    {
      label: "Humedad Suelo",
      value: "58",
      unit: "%",
      range: "40-60%",
      icon: Droplets,
      trend: "down" as const,
      color: "chart-3",
      devices: telemetryStats.deviceCount,
    },
    {
      label: "Ventilación",
      value: "72",
      unit: "%",
      range: "Activada",
      icon: Wind,
      trend: "up" as const,
      color: "chart-4",
      devices: 2,
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Resumen de Telemetría
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {telemetryData.map((item) => (
          <TelemetryCard key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}
