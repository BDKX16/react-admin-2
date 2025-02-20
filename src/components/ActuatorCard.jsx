import * as React from "react";
import PropTypes from "prop-types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import useMqtt from "../hooks/useMqtt";
import CiclosForm from "./CiclosForm";
import TimersForm from "./TimersForm";

export const ActuatorCard = ({ widget, dId, userId, timer, ciclo }) => {
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
    if (value === 1 || value === true) {
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

    //return;
    const toSend = {
      topic: userId + "/" + dId + "/" + widget.variable + "/actdata",
      msg: {
        value: value,
      },
    };

    setSend({ msg: toSend.msg, topic: toSend.topic });
    setValue(null);
  };

  return (
    <Card className="text-left flex md:flex-col p-6 gap-4">
      <CardHeader className="p-0 pb-3 pl-1">
        <CardTitle className="text-lg md:text-xl lg:text-2xl xl:text-3xl ">
          {mapName(widget.variableFullName)}
        </CardTitle>
      </CardHeader>
      <CardContent className=" flex-1 p-0 ">
        <div className="w-full sm:items-center flex flex-row justify-end md:justify-start">
          <div className="flex flex-col space-y-1.5 ">
            <Tabs
              className="w-full flex flex-col items-end justify-end md:items-start"
              value={mapValue(valueRef.current)}
              onValueChange={(e) => sendValue(e)}
            >
              <TabsList>
                <TabsTrigger disabled={valueRef.current === null} value="on">
                  On
                </TabsTrigger>
                <TabsTrigger disabled={valueRef.current === null} value="off">
                  Off
                </TabsTrigger>
                <TabsTrigger
                  disabled={valueRef.current === null}
                  value="timers"
                >
                  Timer
                </TabsTrigger>
                <TabsTrigger
                  disabled={valueRef.current === null}
                  value="cicles"
                >
                  Ciclo
                </TabsTrigger>
              </TabsList>
              <TabsContent value="on"></TabsContent>
              <TabsContent value="off"></TabsContent>
              <TabsContent value="timers">
                <div className="hidden md:block">
                  <TimersForm userId={userId} timers={timer} dId={dId} />
                </div>
                <div className="block md:hidden">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline">Editar temporizador</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Editar temporizador</DrawerTitle>
                      </DrawerHeader>
                      <TimersForm userId={userId} timers={timer} dId={dId} />
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline">Cerrar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </div>
              </TabsContent>
              <TabsContent value="cicles">
                <div className="hidden md:block">
                  <CiclosForm userId={userId} ciclo={ciclo} dId={dId} />
                </div>
                <div className="block md:hidden">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline">Editar ciclo</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Editar ciclo</DrawerTitle>
                      </DrawerHeader>
                      <CiclosForm userId={userId} ciclo={ciclo} dId={dId} />
                      <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline">Cerrar</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
ActuatorCard.propTypes = {
  widget: PropTypes.shape({
    variable: PropTypes.string.isRequired,
    variableFullName: PropTypes.string.isRequired,
    slave: PropTypes.string.isRequired,
  }).isRequired,
  dId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  timer: PropTypes.object.isRequired,
  ciclo: PropTypes.object.isRequired,
};

export default ActuatorCard;
