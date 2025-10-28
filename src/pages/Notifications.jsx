import { useEffect, useState } from "react";
import {
  getNotifications,
  setNotificationRead,
  setAllNotificationsRead,
  addNotificationAlert,
  deleteMobileDevice,
  updateNotificationAlert,
  getMobileDevices,
} from "../services/private";

import { deleteRule, createRule } from "../services/public";

import useFetchAndLoad from "../hooks/useFetchAndLoad";
import useDevices from "../hooks/useDevices";
import { formatNotification } from "../utils/formatNotification";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Smartphone, Trash2, Plus } from "lucide-react";

const Notifications = () => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const { selectedDevice } = useDevices();
  const [notifications, setNotifications] = useState([]);
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    variable: "",
    condition: "",
    value: "",
    triggerTime: 60,
  });

  const [errors, setErrors] = useState({
    variable: false,
    condition: false,
    value: false,
    triggerTime: false,
  });

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChange = (field) => (value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: false,
    }));
  };

  useEffect(() => {
    if (selectedDevice) {
      setAlerts(
        selectedDevice.alarmRules.filter((a) => a.actionVariable == "")
      );
    }
  }, [selectedDevice]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await callEndpoint(getNotifications());
      if (response && !response.error) {
        setNotifications(response.data.data);
      }
    };

    const fetchDevices = async () => {
      const response = await callEndpoint(getMobileDevices());

      if (response && !response.error) {
        setDevices(response.data.devices);
      }
    };

    fetchNotifications();
    fetchDevices();
  }, []);

  const handleAddAlert = async () => {
    const newErrors = {
      variable: !formData.variable,
      condition: !formData.condition,
      value: !formData.value || formData.value < 0 || formData.value > 100,
      triggerTime: !formData.triggerTime || formData.triggerTime < 10,
    };

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    const newRule = {
      variable: formData.variable,
      condition: formData.condition,
      value: formData.value,
      triggerTime: formData.triggerTime,

      dId: selectedDevice.dId,
      status: true,
      variableFullName: selectedDevice.template.widgets.find(
        (x) => x.variable === formData.variable
      ).variableFullName,

      action: 0,
      actionVariable: "",
    };

    const response = await callEndpoint(createRule({ newRule }));
    if (!response.error) {
      setAlerts([...alerts, newRule]);
      // Reset form
      setFormData({
        variable: "",
        condition: "",
        value: "",
        triggerTime: 60,
      });
    }
  };

  const handleDeleteNotifications = async () => {
    const response = await callEndpoint(setAllNotificationsRead());

    if (!response.error) {
      setNotifications([]);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    const { call } = deleteMobileDevice(deviceId);
    const response = await call;
    if (!response.error) {
      setDevices(devices.filter((device) => device._id !== deviceId));
    }
  };

  const setNotificationReaded = async (notificationId) => {
    const response = await callEndpoint(setNotificationRead(notificationId));

    if (!response.error && response.data.status === "success") {
      setNotifications(notifications.filter((n) => n._id !== notificationId));
    }
  };

  const handleUpdateAlert = async (alert) => {
    const updatedAlert = { ...alert, status: !alert.status };
    const response = await callEndpoint(updateNotificationAlert(alert));

    if (!response.error && response.data.status === "success") {
      setAlerts(
        alerts.map((a) =>
          a.emqxRuleId === alert.emqxRuleId ? updatedAlert : a
        )
      );
    }
  };

  const handleDeleteAlert = async (emqxRuleId) => {
    const response = await callEndpoint(deleteRule(emqxRuleId));

    if (!response.error && response.data.status === "success") {
      setAlerts(alerts.filter((a) => a.emqxRuleId !== emqxRuleId));
    }
  };

  const formatName = (name) => {
    if (name === "Hum") {
      return "Humedad ambiente";
    } else if (name === "Hum suelo") {
      return "Humedad del suelo";
    } else if (name === "Temp") {
      return "Temperatura";
    }
    return name;
  };

  const latestNotifications = notifications
    .sort((a, b) => b.time - a.time)
    .slice(0, 9);

  if (
    loading &&
    notifications.length === 0 &&
    devices.length === 0 &&
    alerts.length === 0 &&
    !selectedDevice
  ) {
    return (
      <div className="flex gap-12 flex-col w-full max-w-4xl mx-auto px-4">
        <h2 className="text-xl font-semibold">Notificaciones</h2>
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
      </div>
    );
  }

  return (
    <div className="flex gap-8 flex-col w-full max-w-4xl mx-auto px-4">
      <h2 className="text-xl font-semibold">Notificaciones</h2>

      {/* Sección de Alertas */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-left font-medium">Configurar Alertas</h3>
          <Drawer>
            <DrawerTrigger asChild>
              <Button size={isMobile ? "sm" : "default"}>
                <Plus className="w-4 h-4 mr-1" />
                {isMobile ? "Agregar" : "Agregar Alerta"}
              </Button>
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
                      onValueChange={handleChange("variable")}
                      value={formData.variable}
                    >
                      <SelectTrigger
                        className={
                          errors.variable
                            ? "border-red-500 w-[180px]"
                            : "w-[180px]"
                        }
                      >
                        <SelectValue placeholder="Seleccionar variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDevice?.template?.widgets?.map((widget) => {
                          if (
                            widget.variableFullName !== "Hum" &&
                            widget.variableFullName !== "Temp" &&
                            widget.variableFullName !== "Hum suelo"
                          )
                            return null;
                          return (
                            <SelectItem
                              key={widget.variable}
                              value={widget.variable}
                            >
                              {formatName(widget.variableFullName)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <Label>Condicion:</Label>
                    <Select
                      onValueChange={handleChange("condition")}
                      value={formData.condition}
                    >
                      <SelectTrigger
                        className={
                          errors.condition
                            ? "border-red-500 w-[180px]"
                            : "w-[180px]"
                        }
                      >
                        <SelectValue placeholder="Seleccionar condición" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">Igual a</SelectItem>
                        <SelectItem value="<">Menor que</SelectItem>
                        <SelectItem value=">">Mayor que</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <Label>Valor:</Label>
                    <Input
                      type="number"
                      placeholder="Valor"
                      className={`w-[180px] border border-gray-300 rounded-md p-2 ${
                        errors.value ? "border-red-500" : ""
                      }`}
                      value={formData.value}
                      onChange={(e) => handleChange("value")(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <Label>Minutos entre avisos:</Label>
                    <Input
                      type="number"
                      placeholder="Por defecto 60"
                      className={`w-[180px] border border-gray-300 rounded-md p-2 ${
                        errors.triggerTime ? "border-red-500" : ""
                      }`}
                      value={formData.triggerTime}
                      onChange={(e) =>
                        handleChange("triggerTime")(e.target.value)
                      }
                    />
                  </div>
                </div>
                <DrawerFooter>
                  <Button onClick={handleAddAlert}>Guardar</Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Vista Desktop - Tabla */}
        {!isMobile && (
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
                    <Switch
                      checked={alert.status}
                      disabled={loading}
                      onCheckedChange={() => handleUpdateAlert(alert)}
                    ></Switch>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert.emqxRuleId)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="text-left" colSpan={5}>
                  Total {alerts.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}

        {/* Vista Mobile - Cards */}
        {isMobile && (
          <div className="grid grid-cols-1 gap-3">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Bell className="w-12 h-12 mx-auto opacity-50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay alertas configuradas
                  </p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.emqxRuleId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base text-left">
                          {formatName(alert.variableFullName)}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground text-left mt-1">
                          {formatNotification(alert)}
                        </p>
                      </div>
                      <Switch
                        checked={alert.status}
                        disabled={loading}
                        onCheckedChange={() => handleUpdateAlert(alert)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground text-left">
                        Frecuencia:
                      </span>
                      <Badge variant="outline">
                        Cada {alert.triggerTime} min
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDeleteAlert(alert.emqxRuleId)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
            {alerts.length > 0 && (
              <div className="text-sm text-muted-foreground text-center py-2">
                Total: {alerts.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Dispositivos Móviles */}
      <div className="flex flex-col gap-4">
        <h3 className="text-left font-medium">Dispositivos asociados</h3>

        {/* Vista Desktop - Tabla */}
        {!isMobile && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Nombre</TableHead>
                <TableHead className="text-right">Eliminar celular</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.expoToken}>
                  <TableCell className="font-medium text-left">
                    {device.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDevice(device._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
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
        )}

        {/* Vista Mobile - Cards */}
        {isMobile && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {devices.length === 0 ? (
              <Card className="col-span-2 md:col-span-3">
                <CardContent className="py-8 text-center">
                  <Smartphone className="w-12 h-12 mx-auto opacity-50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No hay dispositivos asociados
                  </p>
                </CardContent>
              </Card>
            ) : (
              devices.map((device) => (
                <Card key={device.expoToken}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Smartphone className="w-5 h-5 text-blue-500" />
                        <CardTitle className="text-base">
                          {device.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDeleteDevice(device._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
            {devices.length > 0 && (
              <div className="text-sm text-muted-foreground text-center py-2 col-span-2 md:col-span-3">
                Total: {devices.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sección de Notificaciones Recibidas */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-left font-medium">Notificaciones recibidas</h3>
          {notifications.length > 0 && (
            <Button
              onClick={handleDeleteNotifications}
              variant="outline"
              size={isMobile ? "sm" : "default"}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar todas
            </Button>
          )}
        </div>

        {/* Vista Desktop - Tabla */}
        {!isMobile && (
          <div className="max-h-[600px] overflow-y-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Variable</TableHead>
                  <TableHead>Condicion</TableHead>
                  <TableHead>Valor Actual</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                  <TableHead className="text-right">
                    Marcar como leida
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestNotifications.map((item) => (
                  <TableRow key={item.time}>
                    <TableCell className="font-medium text-left">
                      {formatName(item.variableFullName)}
                    </TableCell>
                    <TableCell className="text-left">
                      {formatNotification(item)}
                    </TableCell>
                    <TableCell className="text-left">
                      {item?.payload?.value}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(item.time).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNotificationReaded(item._id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="text-left" colSpan={5}>
                    Total {notifications.length}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}

        {/* Vista Mobile - Cards */}
        {isMobile && (
          <div className="max-h-[600px] overflow-y-scroll">
            <div className="grid grid-cols-1 gap-3">
              {latestNotifications.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Bell className="w-12 h-12 mx-auto opacity-50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No hay notificaciones
                    </p>
                  </CardContent>
                </Card>
              ) : (
                latestNotifications.map((item) => (
                  <Card key={item.time}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        {/* Contenido izquierdo */}
                        <div className="flex-1 space-y-1">
                          {/* Variable a la izquierda */}
                          <div className="text-sm font-medium text-left">
                            {item.variableFullName}
                          </div>
                          {/* Condición más grisada */}
                          <p className="text-sm text-muted-foreground text-left">
                            {formatNotification(item)}
                          </p>
                          {/* Fecha */}
                          <div className="text-xs text-muted-foreground text-left mt-1">
                            {new Date(item.time).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>

                        {/* Botón a la derecha */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setNotificationReaded(item._id)}
                          className="shrink-0"
                        >
                          Marcar como leída
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              {notifications.length > 0 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  Total: {notifications.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
