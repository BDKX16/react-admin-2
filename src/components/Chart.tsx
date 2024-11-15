"use client";

import { TrendingUp } from "lucide-react";

import { CartesianGrid, Line, LineChart, XAxis, Area } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { useEffect, useState } from "react";
import { getChartsData, getDayChartsData } from "../services/private";
import {
  createChartDataAdapter,
  createChartDateTimeAdapter,
  createChartDateTimeAdapterActuator,
} from "@/adapters/chart-data";
import useCalendar from "@/hooks/useCalendar";

const chartConfig = {
  temp: {
    label: "Temperatura",
    color: "hsl(var(--chart-5))",
  },
  hum: {
    label: "Humedad relativa",
    color: "hsl(var(--chart-1))",
  },
  soilhum: {
    label: "Humedad del suelo",
    color: "hsl(var(--chart-2))",
  },
  light: {
    label: "Luces",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function Chart() {
  const { selectedDate } = useCalendar();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { pageTreshold, setPageTreshold } = useState(7000000);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await callEndpoint(
        getDayChartsData("sr8A3ZskGQ", "OHFEn7XH3K", selectedDate)
      );

      const result2 = await callEndpoint(
        getDayChartsData("sr8A3ZskGQ", "i3gutmDSSB", selectedDate)
      );

      const result3 = await callEndpoint(
        getDayChartsData("sr8A3ZskGQ", "tHNdg4S8sV", selectedDate)
      );

      const result4 = await callEndpoint(
        getDayChartsData("sr8A3ZskGQ", "ONPAgFDsIA", selectedDate)
      );

      if (!result || Object.keys(result)?.length === 0) {
        return;
      } else {
        if (
          result.data.data.length !== 0 ||
          result2.data.data.length !== 0 ||
          result3.data.data.length !== 0 ||
          result4.data.data.length !== 0
        ) {
          const combined = combineArrays([
            result.data.data.map((item) => createChartDateTimeAdapter(item)),
            result2.data.data.map((item) => createChartDateTimeAdapter(item)),
            result3.data.data.map((item) => createChartDateTimeAdapter(item)),
            result4.data.data.map((item) =>
              createChartDateTimeAdapterActuator(item)
            ),
          ]);

          addSteppedValues(combined);
          setData(
            combined.map((item) => ({
              ...item,
              time: new Date(item.time).toLocaleString(),
            }))
          );
        }
      }
    };
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    const fetchData = async () => {
      var timeAgo = 9000; //9000;
      const result = await callEndpoint(
        getChartsData("sr8A3ZskGQ", "OHFEn7XH3K", timeAgo)
      );

      const result2 = await callEndpoint(
        getChartsData("sr8A3ZskGQ", "i3gutmDSSB", timeAgo)
      );

      const result3 = await callEndpoint(
        getChartsData("sr8A3ZskGQ", "tHNdg4S8sV", timeAgo)
      );

      const result4 = await callEndpoint(
        getChartsData("sr8A3ZskGQ", "ONPAgFDsIA", timeAgo)
      );

      if (!result || Object.keys(result)?.length === 0) {
        return;
      } else {
        if (result.data.data.length === 0) {
          setData([]);
        } else {
          //setData(result.data.data.map((item) => createChartDataAdapter(item)));

          const combined = combineArrays(
            [
              result.data.data.map((item) => createChartDateTimeAdapter(item)),
              result2.data.data.map((item) => createChartDateTimeAdapter(item)),
              result3.data.data.map((item) => createChartDateTimeAdapter(item)),
              result4.data.data.map((item) =>
                createChartDateTimeAdapterActuator(item)
              ),
            ],
            pageTreshold
          );

          addSteppedValues(combined);
          setData(
            combined.map((item) => ({
              ...item,
              time: new Date(item.time).toLocaleString(),
            }))
          );
        }
      }
    };
    fetchData();
  }, []);

  const combineArrays = (arrays, threshold = 7000000) => {
    //golden ratio: 7000000
    const combined = {};

    const getVariableName = (variable) => {
      if (variable === "OHFEn7XH3K") return "temp";
      if (variable === "tHNdg4S8sV") return "soilhum";
      if (variable === "i3gutmDSSB") return "hum";
      if (variable === "ONPAgFDsIA") return "light";
      return variable;
    };

    const addToCombined = (item) => {
      const time = item.time.getTime();
      let found = false;

      for (const key in combined) {
        if (Math.abs(key - time) <= threshold) {
          combined[key][getVariableName(item.variable)] = item.value;
          found = true;
          break;
        }
      }

      if (!found) {
        combined[time] = { time: item.time };
        combined[time][getVariableName(item.variable)] = item.value;
      }
    };

    if (!Array.isArray(arrays)) {
      throw new TypeError("Expected an array of arrays");
    }

    arrays.forEach((array) => {
      if (!Array.isArray(array)) {
        throw new TypeError("Each element of arrays should be an array");
      }
      array.forEach(addToCombined);
    });

    return Object.values(combined);
  };

  const addSteppedValues = (data) => {
    if (data.length === 0) return data;

    let lastKnownValues = {};
    let firstKnownValues = null;
    for (let i = 0; i < data.length; i++) {
      const currentItem = data[i];

      if (
        lastKnownValues.light === undefined &&
        currentItem.light !== undefined &&
        firstKnownValues === null
      ) {
        firstKnownValues = { ...currentItem };
        for (let count = 0; count < i; count++) {
          data[count] = { ...data[count], light: firstKnownValues.light };
        }
      }

      // Check if light has a definition, if not, add the last known light value
      if (
        currentItem.light === undefined &&
        lastKnownValues.light !== undefined
      ) {
        currentItem.light = lastKnownValues.light;
      }

      // Update the last known values for all variables
      lastKnownValues = { ...lastKnownValues, ...currentItem };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Multiple</CardTitle>
        <CardDescription>Ultima semana</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            title="Line Chart -"
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              allowDataOverflow={false}
              dataKey="time"
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="temp"
              type="natural"
              stroke="var(--color-temp)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="hum"
              type="natural"
              stroke="var(--color-hum)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="soilhum"
              type="natural"
              stroke="var(--color-soilhum)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="light"
              type="step"
              stroke="var(--color-light)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
