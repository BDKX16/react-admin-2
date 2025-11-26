import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useEffect, useState } from "react";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { createChartDateTimeAdapter } from "@/adapters/chart-data";

import { getChartsData } from "../services/private";

import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { Skeleton } from "./ui/skeleton";

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function MiniChart({ color, variable, dId, sensorName }) {
  const [chartData, setChartData] = useState(null);
  const { loading, callEndpoint } = useFetchAndLoad();

  useEffect(() => {
    // Reset chart data when device changes
    setChartData(null);

    const fetchData = async () => {
      var timeAgo = 2000; //9000;
      const data = await callEndpoint(getChartsData(dId, variable, timeAgo));

      const combined = combineArrays(
        data.data.data.map((item) => createChartDateTimeAdapter(item))
      );

      setChartData(
        combined.map((item) => ({
          ...item,
          time: new Date(item.time).toLocaleString(),
        }))
      );
    };
    fetchData();
  }, [dId, variable]);

  const combineArrays = (array, threshold = 3000000) => {
    //golden ratio: 7000000
    const combined = {};

    const addToCombined = (item) => {
      const time = item.time.getTime();
      let found = false;

      for (const key in combined) {
        if (Math.abs(key - time) <= threshold) {
          combined[key]["value"] = item.value;
          found = true;
          break;
        }
      }

      if (!found) {
        combined[time] = { time: item.time };
        combined[time]["value"] = item.value;
      }
    };

    array.forEach(addToCombined);

    return Object.values(combined);
  };

  const selectColor = () => {
    // Primero intentar mapeo basado en widget.name (sensor type)
    const colorMapping = {
      Temperatura: "hsl(var(--chart-temperature))",
      "Humedad Ambiente": "hsl(var(--chart-humidity))",
      "Humedad del Suelo": "hsl(var(--chart-soil-humidity))",
      pH: "hsl(var(--chart-ph))",
      CO2: "hsl(var(--chart-carbon-dioxide))",
    };

    // Si hay un sensorName, usar el mapeo específico
    if (sensorName && colorMapping[sensorName]) {
      return colorMapping[sensorName];
    }

    // Fallback a color legacy por si acaso
    switch (color) {
      case "Red":
        return "hsl(var(--chart-5))";
      case "Green":
        return "hsl(var(--chart-2))";
      case "Yellow":
        return "hsl(var(--chart-3))";
      case "Blue":
        return "hsl(var(--chart-1))";
      default:
        return "hsl(var(--chart-4))";
    }
  };
  if (loading) {
    return <Skeleton className="h-[60px] sm:h-[90px] w-full" />;
  }
  return (
    <ChartContainer
      className="h-[60px] sm:h-[90px] w-full"
      id={variable}
      config={chartConfig}
    >
      <AreaChart accessibilityLayer data={chartData} aspect={3}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          hide={true}
          dataKey="time"
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient
            id={`fillDesktop-${variable}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="5%" stopColor={selectColor()} stopOpacity={0.8} />
            <stop offset="95%" stopColor={selectColor()} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <Area
          dataKey="value"
          type="natural"
          fill={`url(#fillDesktop-${variable})`}
          fillOpacity={0.4}
          stroke={selectColor()}
          strokeWidth={1.5}
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
