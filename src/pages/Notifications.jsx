import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const notifications = [
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 20 },
    value: "-2",
    readed: false,
    time: 1699051290505,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
  {
    condition: "<",
    dId: "PaJg0l2ueu",
    emqxRuleId: "rule:f164d786",
    payload: { value: 30 },
    value: "-2",
    readed: false,
    time: 1699051290504,
    topic: "64e3c5873c628728f9d1e13d/PaJg0l2ueu/G7DxrJ4VS2/sdata",
    userId: "64e3c5873c628728f9d1e13d",
    variable: "G7DxrJ4VS2",
    variableFullName: "Hum suelo",
  },
];

const devices = [
  {
    name: "Samsung S22",
    expoToken: "asd2da",
    _id: "asad3dd2d",
  },
  {
    name: "Nokie S22",
    expoToken: "asd2da",
    _id: "asad6dd2d",
  },
  {
    name: "Android S22",
    expoToken: "asd2da",
    _id: "asadud2d",
  },
  {
    name: "Motorola S22",
    expoToken: "asd2da",
    _id: "ashd2dd2d",
  },
  {
    name: "Xiaomi S22",
    expoToken: "asd2da",
    _id: "aaad2dd2d",
  },
];

const alerts = [
  {
    emqxRuleId: "rule:f164d786",
    variableFullName: "Hum suelo",
    triggerTime: 20,
    status: true,
    value: 10,
    condition: "<",
  },
];

const Notifications = () => {
  const formatNotification = (notif) => {
    let fullName = notif.variableFullName;
    if (notif.variableFullName === "Hum") {
      fullName = "humedad ambiente";
    } else if (notif.variableFullName === "Hum suelo") {
      fullName = "humedad del suelo";
    } else if (notif.variableFullName === "Temp") {
      fullName = "temperatura";
    }

    let condicion = notif.condition;
    if (notif.condition === "<") {
      condicion = "menor";
    } else if (notif.condition === ">") {
      condicion = "mayor";
    } else if (notif.condition === "=>") {
      condicion = "mayor o igual a";
    } else if (notif.condition === "=<") {
      condicion = "menor o igual";
    } else if (notif.condition === "=") {
      condicion = "igual";
    } else if (notif.condition === "!=") {
      condicion = "distinto";
    }

    return "La " + fullName + " es " + condicion + " que " + notif.value;
  };

  const formatName = (name) => {
    if (name === "Hum") {
      return "Humedad ambiente";
    } else if (name === "Hum suelo") {
      return "Humedad del suelo";
    } else if (name === "Temp") {
      return "Hemperatura";
    }
  };

  const handleAddAlert = () => {
    // Lógica para agregar una nueva alerta
    console.log("Agregar nueva alerta");
  };

  const handleDeleteNotifications = () => {
    // Lógica para agregar una nueva alerta
    console.log("handleDeleteNotifications");
  };

  const latestNotifications = notifications
    .sort((a, b) => b.time - a.time)
    .slice(0, 9);

  return (
    <div className="flex gap-6 flex-col w-full max-w-4xl mx-auto">
      <div>
        <Label>Configurar Alertas.</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Variable</TableHead>
              <TableHead>Tiempo entre Activaciones</TableHead>
              <TableHead>Alerta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.emqxRuleId}>
                <TableCell className="font-medium text-left">
                  {formatName(alert.variableFullName)}
                </TableCell>
                <TableCell className="text-left">
                  Cada {alert.triggerTime} minutos
                </TableCell>
                <TableCell className="text-left">
                  {formatNotification(alert)}
                </TableCell>
                <TableCell className="text-left">
                  <Switch checked={alert.status}></Switch>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline">Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="text-left" colSpan={4}>
                Total {alerts.length}
              </TableCell>
              <TableCell className="text-right">
                {" "}
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button>+ Agregar Alerta</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                      <DrawerHeader>
                        <DrawerTitle>Generar Alerta</DrawerTitle>
                        <DrawerDescription>
                          Crea una alerta para que te llegue una notificacion al
                          celular.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 pb-0 gap-2 flex flex-col">
                        <div className="flex items-center justify-end space-x-2">
                          <Label>Variable:</Label>
                          <Select
                            defaultValue={"Hum"}
                            onValueChange={(value) => console.log(value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Hum">Humedad</SelectItem>
                              <SelectItem value="Temp">Temperatura</SelectItem>
                              <SelectItem value="Hum Soil">
                                Humedad del suelo
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <Label>Condicion:</Label>
                          <Select
                            defaultValue={"<"}
                            onValueChange={(value) => console.log(value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="=">Igual a</SelectItem>
                              <SelectItem value="<">Mayor que</SelectItem>
                              <SelectItem value=">">Menor que</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <Label>Valor:</Label>
                          <Input
                            type="number"
                            className="w-[180px] border border-gray-300 rounded-md p-2"
                          />
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                          <Label>Minutos entre avisos:</Label>
                          <Input
                            type="number"
                            placeholder="Por defecto 60"
                            className="w-[180px] border border-gray-300 rounded-md p-2"
                          />
                        </div>
                      </div>
                      <DrawerFooter>
                        <Button>Submit</Button>
                        <DrawerClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <div>
        <Label>Dispositivos asociados.</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nombre</TableHead>
              <TableHead className="text-right">Eliminar celular</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device._id}>
                <TableCell className="font-medium text-left">
                  {device.name}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline">Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="text-left" colSpan={2}>
                Total {devices.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default Notifications;
