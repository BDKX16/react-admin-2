import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import MiniChart from "./MiniChart";
import useMqtt from "../hooks/useMqtt";

export const InputCard = ({ widget, dId }) => {
  const valueRef = React.useRef(null);
  const setValue = (newValue) => {
    valueRef.current = newValue;
  };
  const { recived } = useMqtt();

  React.useEffect(() => {
    if (recived) {
      //console.log(recived);
      recived.map((item) => {
        if (item.dId === dId && item.variable === widget.variable) {
          //setConfig({ ...config, value: item.value });
          setValue(item.value);
        }
      });
    }
  }, [recived]);

  const mapName = (variableFullName) => {
    switch (variableFullName) {
      case "Temp":
        return "Temperatura";
      case "Hum":
        return "Humedad ambiente";
      case "Hum suelo":
        return "Humedad del suelo";
    }
  };

  const errorHandeOnValue = (value, unidad) => {
    if (value == -2) {
      return "Error";
    } else if (value == -3) {
      return "Disconnected";
    }

    return value ? value + " " + unidad : " - " + unidad;
  };

  return (
    <Card className="text-left flex md:flex-col p-6">
      <CardHeader className="p-0 pb-3 pl-1 min-w-[130px]">
        <CardDescription className="text-wrap truncate">
          {mapName(widget.variableFullName)}
        </CardDescription>
        <CardTitle className="text-3xl">
          {errorHandeOnValue(valueRef.current, widget.unidad)}
        </CardTitle>
      </CardHeader>
      <CardContent className=" flex-1 p-0">
        <div className="w-full sm:items-center ">
          <div className="flex flex-col space-y-1.5 ">
            <MiniChart
              color={widget.color}
              variable={widget.variable}
              dId={dId}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InputCard;
