import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useMqtt from "../hooks/useMqtt";

export const ActuatorCard = ({ widget, dId, userId }) => {
  const valueRef = React.useRef(null);
  const setValue = (newValue) => {
    valueRef.current = newValue;
  };
  const { recived, setSend } = useMqtt();

  //console.log(widget);
  React.useEffect(() => {
    if (recived) {
      recived.map((item) => {
        if (item.dId === dId && item.variable === widget.slave) {
          //setConfig({ ...config, value: item.value });
          setValue(item.value);
        }
      });
    }
  }, [recived]);

  const handleChange = (e) => {
    console.log(e);
  };

  const mapValue = (value) => {
    if (value === 1 || value == true) {
      return "on";
    } else if (value === 0 || value === false) {
      return "off";
    } else if (value === 2 || value === 3) {
      return "timers";
    } else if (value === 4 || value === 5) {
      return "cicles";
    }
  };

  const mapName = (variableFullName) => {
    return variableFullName;
    switch (variableFullName) {
      case "Temp":
        return "Temperatura";
      case "Hum":
        return "Humedad ambiente";
      case "Hum suelo":
        return "Humedad del suelo";
    }
  };

  const sendValue = (value) => {
    if (value === null) {
      return;
    } else if (value === "on") {
      value = true;
    } else if (value === "off") {
      value = false;
    } else if (value === "timers") {
      value = 3;
    } else if (value === "cicles") {
      value = 5;
    }
    console.log(value);
    //return;
    const toSend = {
      topic: userId + "/" + dId + "/" + widget.variable + "/actdata",
      msg: {
        value: value,
      },
    };

    setSend({ msg: toSend.msg, topic: toSend.topic });
  };

  return (
    <Card className="text-left flex md:flex-col p-6 ">
      <CardHeader className="p-0 pb-3 pl-1 min-w-[130px]">
        <CardTitle className="text-3xl">
          {mapName(widget.variableFullName)}
        </CardTitle>
      </CardHeader>
      <CardContent className=" flex-1 p-0">
        <div className="w-full sm:items-center ">
          <div className="flex flex-col space-y-1.5 ">
            <Tabs
              defaultValue="on"
              value={mapValue(valueRef.current)}
              onValueChange={(e) => sendValue(e)}
              className="w-[400px]"
            >
              <TabsList>
                <TabsTrigger value="on">On</TabsTrigger>
                <TabsTrigger value="off">Off</TabsTrigger>
                <TabsTrigger value="timers">Timer</TabsTrigger>
                <TabsTrigger value="cicles">Ciclo</TabsTrigger>
              </TabsList>
              <TabsContent value="on"></TabsContent>
              <TabsContent value="off"></TabsContent>
              <TabsContent value="timers">Set timers hours</TabsContent>
              <TabsContent value="cicles">
                <p>Set time on</p>
                <p>Set time off</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActuatorCard;
