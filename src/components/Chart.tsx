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

export default function Chart({ device }) {
  const { selectedDate } = useCalendar();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { pageTreshold, setPageTreshold } = useState(7000000);
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchDaysData = async () => {
      let widgets = [];

      device.template.widgets.forEach((element) => {
        if (
          (element.variableFullName === "Luces" &&
            element.widgetType === "Indicator") ||
          element.variableFullName === "Temp" ||
          element.variableFullName === "Hum" ||
          element.variableFullName === "Hum suelo"
        ) {
          widgets.push(element);
        }
      });
      const response = await Promise.all(
        widgets.map(async (element) => {
          const data = await callEndpoint(
            getDayChartsData(device.dId, element.variable, selectedDate)
          );
          if (
            element.variableFullName === "Luces" &&
            element.widgetType === "Indicator"
          ) {
            return data.data.data.map((item) =>
              createChartDateTimeAdapterActuator(item)
            );
          } else {
            return data.data.data.map((item) =>
              createChartDateTimeAdapter(item)
            );
          }
        })
      );

      const combined = combineArrays(response, pageTreshold);

      addSteppedValues(combined);
      setData(
        combined.map((item) => ({
          ...item,
          time: new Date(item.time).toLocaleString(),
        }))
      );
    };
    fetchDaysData();
  }, [selectedDate]);

  useEffect(() => {
    const fetchData = async () => {
      var timeAgo = 12000; //9000;
      let widgets = [];

      device.template.widgets.forEach((element) => {
        if (
          (element.variableFullName === "Luces" &&
            element.widgetType === "Indicator") ||
          element.variableFullName === "Temp" ||
          element.variableFullName === "Hum" ||
          element.variableFullName === "Hum suelo"
        ) {
          widgets.push(element);
        }
      });
      const response = await Promise.all(
        widgets.map(async (element) => {
          const data = await callEndpoint(
            getChartsData(device.dId, element.variable, timeAgo)
          );
          if (
            element.variableFullName === "Luces" &&
            element.widgetType === "Indicator"
          ) {
            return data.data.data.map((item) =>
              createChartDateTimeAdapterActuator(item)
            );
          } else {
            return data.data.data.map((item) =>
              createChartDateTimeAdapter(item)
            );
          }
        })
      );

      const combined = combineArrays(response, pageTreshold);

      addSteppedValues(combined);
      setData(
        combined.map((item) => ({
          ...item,
          time: new Date(item.time).toLocaleString(),
        }))
      );
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
        <CardTitle>{device.name}</CardTitle>
        <CardDescription>Ultima semana</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[78dvh] w-[100%]">
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
