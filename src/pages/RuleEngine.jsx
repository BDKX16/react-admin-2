import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Crown,
  Sparkles,
  Plus,
  ChevronDown,
  Zap,
  GitBranch,
  Trash2,
  Edit,
  Eye,
  Network,
  Clock,
  Monitor,
  Power,
  PowerOff,
  Timer,
} from "lucide-react";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { Slider } from "@/components/ui/slider";
import useDevices from "../hooks/useDevices";
import useSubscription from "../hooks/useSubscription";
import { useOnboarding } from "../contexts/OnboardingContext";
import { rulesTour } from "../config/tours";
import UpdateRuleDialog from "@/components/UpdateRuleDialog";
import {
  MobileAutomationTypeSelector,
  MobileAutomationGrid,
} from "./RuleEngine_mobile";

import {
  createRule,
  deleteRule,
  deleteCompositeRule,
} from "../services/public";
import {
  getWorkflows,
  deleteWorkflow,
  toggleWorkflow,
} from "../services/workflow";

const RuleEngine = () => {
  const navigate = useNavigate();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { selectedDevice } = useDevices();
  const { planData, isPro, isPlus } = useSubscription();
  const { hasCompletedOnboarding, startTour } = useOnboarding();
  const [rules, setRules] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Auto-start rules tour if not completed
  useEffect(() => {
    if (!hasCompletedOnboarding("rules") && selectedDevice) {
      const timer = setTimeout(() => {
        startTour("rules", rulesTour);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, startTour, selectedDevice]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Estados para los modales y drawers
  const [automationModalOpen, setAutomationModalOpen] = useState(false);
  const [automationType, setAutomationType] = useState(null); // 'simple', 'composite', 'scheduled'

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Obtener límites del plan
  const maxRules = planData?.planLimits?.maxRules || 0;
  const currentRulesCount = rules?.length || 0;
  const hasReachedLimit = maxRules !== -1 && currentRulesCount >= maxRules;
  const canCreateRules = maxRules === -1 || currentRulesCount < maxRules;

  // Función para cargar workflows
  const loadWorkflows = useCallback(async () => {
    try {
      const deviceId = selectedDevice?.dId;
      const response = await getWorkflows(deviceId);
      if (response.success) {
        setWorkflows(response.data);
      }
    } catch (error) {
      console.error("Error cargando workflows:", error);
    }
  }, [selectedDevice?.dId]);

  useEffect(() => {
    setRules(
      selectedDevice?.alarmRules?.sort((a, b) =>
        b.variableFullName.localeCompare(a.variableFullName)
      )
    );

    // Cargar workflows visuales
    loadWorkflows();
  }, [selectedDevice, loadWorkflows]);

  const [formData, setFormData] = useState({
    variable: "",
    condition: "",
    value: "",
    action: "",
    actuator: "",
    triggerTime: 20,
  });

  // Estado para automatización programada
  const [scheduleData, setScheduleData] = useState({
    datetime: undefined, // Para fecha y hora específica (Date object)
    isRecurring: false, // Si es recurrente
    selectedDays: [], // Días seleccionados para recurrencia
    hour: "", // Hora para recurrencia
    minute: "", // Minutos para recurrencia
    action: "",
    actuator: "",
  });

  const [errors, setErrors] = useState({
    variable: false,
    condition: false,
    value: false,
    action: false,
    actuator: false,
  });

  // Errores para automatización programada
  const [scheduleErrors, setScheduleErrors] = useState({
    datetime: false,
    selectedDays: false,
    hour: false,
    minute: false,
    action: false,
    actuator: false,
  });

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

  const handleScheduleChange = (field) => (value) => {
    setScheduleData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    setScheduleErrors((prevErrors) => ({
      ...prevErrors,
      [field]: false,
    }));
  };

  const handleDayToggle = (day) => {
    setScheduleData((prevData) => {
      const currentDays = prevData.selectedDays;
      const newDays = currentDays.includes(day)
        ? currentDays.filter((d) => d !== day)
        : [...currentDays, day];

      return {
        ...prevData,
        selectedDays: newDays,
      };
    });
    setScheduleErrors((prevErrors) => ({
      ...prevErrors,
      selectedDays: false,
    }));
  };

  const handleCreate = async () => {
    // Verificar límite de reglas antes de validar campos
    if (!canCreateRules) {
      return;
    }

    const newErrors = {
      variable: !formData.variable,
      condition: !formData.condition,
      value: !formData.value,
      action: !formData.action,
      actuator: !formData.actuator,
    };

    if (Object.values(newErrors).some((error) => error)) {
      setErrors(newErrors);
      return;
    }

    // Buscar el widget que coincide con la variable seleccionada
    const selectedWidget = selectedDevice?.template?.widgets?.find(
      (widget) => widget.variable === formData.variable
    );

    // Usar el variableFullName del widget encontrado, o fallback a la variable
    const variableFullName =
      selectedWidget?.variableFullName || formData.variable;

    const alarmRule = {
      dId: selectedDevice.dId,
      status: true,
      variableFullName: variableFullName,
      variable: formData.variable,
      value: formData.value,
      condition: formData.condition,
      triggerTime: formData.triggerTime,
      action: formData.action,
      actionVariable: formData.actuator,
    };

    const res = await callEndpoint(createRule({ newRule: alarmRule }));

    if (!res.error) {
      // Limpiar formulario después de crear exitosamente
      setFormData({
        variable: "",
        condition: "",
        value: "",
        action: "",
        actuator: "",
        triggerTime: 20,
      });
      setErrors({
        variable: false,
        condition: false,
        value: false,
        action: false,
        actuator: false,
      });
    }
  };

  const handleCreateScheduled = async () => {
    // Verificar límite de reglas antes de validar campos
    if (!canCreateRules) {
      return;
    }

    let newErrors = {};

    if (scheduleData.isRecurring) {
      // Validación para automatización recurrente
      newErrors = {
        selectedDays: !scheduleData.selectedDays.length,
        hour: !scheduleData.hour,
        minute: !scheduleData.minute,
        action: !scheduleData.action,
        actuator: !scheduleData.actuator,
        datetime: false,
      };
    } else {
      // Validación para automatización única
      newErrors = {
        datetime: !scheduleData.datetime,
        action: !scheduleData.action,
        actuator: !scheduleData.actuator,
        selectedDays: false,
        hour: false,
        minute: false,
      };
    }

    if (Object.values(newErrors).some((error) => error)) {
      setScheduleErrors(newErrors);
      return;
    }

    // Buscar el widget que coincide con el actuador seleccionado
    const selectedWidget = selectedDevice?.template?.widgets?.find(
      (widget) => widget.variable === scheduleData.actuator
    );

    let scheduledRule = {
      dId: selectedDevice.dId,
      status: true,
      type: "scheduled",
      action: scheduleData.action,
      actionVariable: scheduleData.actuator,
      actuatorName: selectedWidget?.variableFullName || scheduleData.actuator,
    };

    if (scheduleData.isRecurring) {
      // Configuración para automatización recurrente
      scheduledRule.schedule = {
        type: "recurring",
        days: scheduleData.selectedDays,
        hour: parseInt(scheduleData.hour),
        minute: parseInt(scheduleData.minute),
      };
    } else {
      // Configuración para automatización única
      const selectedDate = scheduleData.datetime;
      scheduledRule.schedule = {
        type: "once",
        datetime: selectedDate.toISOString(),
        day: selectedDate.getDay(),
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes(),
      };
    }

    const res = await callEndpoint(createRule({ newRule: scheduledRule }));

    if (!res.error) {
      // Limpiar formulario después de crear exitosamente
      setScheduleData({
        datetime: "",
        isRecurring: false,
        selectedDays: [],
        hour: "",
        minute: "",
        action: "",
        actuator: "",
      });
      setScheduleErrors({
        datetime: false,
        selectedDays: false,
        hour: false,
        minute: false,
        action: false,
        actuator: false,
      });
      setAutomationType(null);
      setAutomationModalOpen(false);
    }
  };

  const handleDelete = async (rule) => {
    let res;

    if (rule.type === "composite") {
      // Regla compuesta - usar API
      res = await callEndpoint(deleteCompositeRule(rule._id));
    } else {
      // Regla simple - usar API tradicional
      res = await callEndpoint(deleteRule(rule.emqxRuleId));
    }

    if (!res.error) {
      setRules((prevRules) =>
        prevRules.filter((r) =>
          rule.type === "composite"
            ? r._id !== rule._id
            : r.emqxRuleId !== rule.emqxRuleId
        )
      );
    }
  };

  // Funciones para manejo de workflows
  const handleEditWorkflow = (workflowId) => {
    navigate(`/automation-editor?id=${workflowId}`);
  };

  const handleDeleteWorkflow = (workflow) => {
    setItemToDelete({ type: "workflow", item: workflow });
    setDeleteConfirmOpen(true);
  };

  const handleToggleWorkflow = async (workflow) => {
    try {
      await toggleWorkflow(workflow._id, !workflow.enabled);
      // Recargar workflows después del toggle
      loadWorkflows();
    } catch (error) {
      console.error("Error cambiando estado del workflow:", error);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "workflow") {
        await deleteWorkflow(itemToDelete.item._id);
        setWorkflows((prev) =>
          prev.filter((w) => w._id !== itemToDelete.item._id)
        );
      }
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  };

  const handleCreateNewWorkflow = () => {
    navigate("/automation-editor");
  };

  const formatRule = (notif) => {
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

    return "Si la " + fullName + " es " + condicion + " que " + notif.value;
  };

  const formatAction = (action) => {
    if (action === "true" || action === 0) {
      return "Encender ";
    } else if (action === "false" || action === 1) {
      return "Apagar ";
    } else if (action === "3") {
      return "Poner en modo Timer ";
    } else if (action === "5") {
      return "Poner en modo Ciclos ";
    }
  };

  if (!selectedDevice) {
    return (
      <div className="flex flex-col items-center p-4">
        <h1 className="text-2xl font-bold mb-2 text-left">
          Control Automatico
        </h1>
        <div className="w-full max-w-3xl">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-left mb-2">Cargando...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex flex-col gap-2 align-center justify-center">
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Existing Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-10 w-full mb-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div data-tour="rules-page" className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-2 text-left">Control Automático</h1>
      <div className="w-full max-w-7xl">
        {/* Modal/Drawer para seleccionar tipo de automatización */}
        {isMobile ? (
          <Drawer
            open={automationModalOpen}
            onOpenChange={(open) => {
              setAutomationModalOpen(open);
              if (!open) setAutomationType(null);
            }}
          >
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>
                  {!automationType && "Selecciona el tipo de automatización"}
                  {automationType === "simple" && "Crear automatización simple"}
                  {automationType === "scheduled" &&
                    "Crear automatización programada"}
                </DrawerTitle>
                <DrawerDescription>
                  {!automationType &&
                    "Elige el tipo de automatización que deseas crear:"}
                  {automationType === "simple" &&
                    "Define una condición y una acción para tu dispositivo."}
                  {automationType === "scheduled" &&
                    "Programa una acción para que se ejecute en una fecha y hora específica, o de forma recurrente."}
                </DrawerDescription>
              </DrawerHeader>

              {!automationType && (
                <>
                  <div
                    data-tour="automation-type-selector"
                    className="flex flex-col gap-4 p-4"
                  >
                    <Button
                      variant="outline"
                      className="flex gap-2 justify-start h-auto py-4"
                      onClick={() => setAutomationType("simple")}
                    >
                      <Zap className="w-5 h-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Simple</span>
                        <span className="text-xs text-muted-foreground">
                          Condición y acción
                        </span>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex gap-2 justify-start h-auto py-4"
                      onClick={() => setAutomationType("scheduled")}
                    >
                      <Clock className="w-5 h-5" />
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">Programada</span>
                        <span className="text-xs text-muted-foreground">
                          Por horario
                        </span>
                      </div>
                    </Button>
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                      <CardContent className="pt-4 flex gap-3">
                        <Monitor className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-sm">
                            Automatización Compuesta
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Para crear automatizaciones avanzadas, accede desde
                            una computadora.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </>
              )}

              {/* Simple automation form para Drawer */}
              {automationType === "simple" && (
                <>
                  <div className="px-4 pb-4 overflow-y-auto max-h-[60vh]">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Variable</Label>
                        <Select
                          onValueChange={handleChange("variable")}
                          value={formData.variable}
                        >
                          <SelectTrigger
                            className={errors.variable ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Variable" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedDevice?.template?.widgets?.map(
                              (widget) => {
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
                                    {widget.variableFullName}
                                  </SelectItem>
                                );
                              }
                            )}
                          </SelectContent>
                        </Select>
                        {errors.variable && (
                          <Label className="text-red-500 text-xs">
                            Campo variable requerido
                          </Label>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Condición</Label>
                        <Select
                          onValueChange={handleChange("condition")}
                          value={formData.condition}
                        >
                          <SelectTrigger
                            className={errors.condition ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Condición" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="=">Igual a</SelectItem>
                            <SelectItem value=">=">Mayor que</SelectItem>
                            <SelectItem value="<">Menor que</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.condition && (
                          <Label className="text-red-500 text-xs">
                            Campo condición requerido
                          </Label>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Valor</Label>
                        <Input
                          placeholder="Valor"
                          type="number"
                          className={errors.value ? "border-red-500" : ""}
                          value={formData.value}
                          onChange={(e) =>
                            handleChange("value")(e.target.value)
                          }
                        />
                        {errors.value && (
                          <Label className="text-red-500 text-xs">
                            Campo requerido
                          </Label>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Acción</Label>
                        <Select
                          onValueChange={handleChange("action")}
                          value={formData.action}
                        >
                          <SelectTrigger
                            className={errors.action ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Acción" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Encender</SelectItem>
                            <SelectItem value="false">Apagar</SelectItem>
                            <SelectItem value="3">
                              Poner en modo Timer
                            </SelectItem>
                            <SelectItem value="5">
                              Poner en modo Ciclos
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.action && (
                          <Label className="text-red-500 text-xs">
                            Campo acción requerido
                          </Label>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Actuador</Label>
                        <Select
                          onValueChange={handleChange("actuator")}
                          value={formData.actuator}
                        >
                          <SelectTrigger
                            className={errors.actuator ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Actuador" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedDevice?.template?.widgets?.map(
                              (widget) => {
                                if (widget.widgetType !== "Switch") return null;
                                return (
                                  <SelectItem
                                    key={widget.variable}
                                    value={widget.variable}
                                  >
                                    {widget.variableFullName}
                                  </SelectItem>
                                );
                              }
                            )}
                          </SelectContent>
                        </Select>
                        {errors.actuator && (
                          <Label className="text-red-500 text-xs">
                            Campo actuador requerido
                          </Label>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="font-bold">
                          Tiempo entre activaciones: {formData.triggerTime}{" "}
                          minutos
                        </Label>
                        <Slider
                          min={10}
                          max={60}
                          step={1}
                          value={[formData.triggerTime]}
                          onValueChange={(value) =>
                            handleChange("triggerTime")(value[0])
                          }
                        />
                        <Label className="text-gray-500 text-xs">
                          Ajustá este valor para definir el tiempo que debe
                          pasar entre activaciones una vez sobrepasado el
                          limite.
                        </Label>
                      </div>
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button
                      onClick={handleCreate}
                      disabled={!canCreateRules}
                      className={
                        !canCreateRules ? "opacity-50 cursor-not-allowed" : ""
                      }
                    >
                      {hasReachedLimit
                        ? "Límite alcanzado"
                        : "Crear automatización"}
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAutomationType(null);
                        }}
                      >
                        Cancelar
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </>
              )}

              {/* Scheduled automation form para mobile */}
              {automationType === "scheduled" && (
                <>
                  <div className="flex flex-col gap-4 p-4 max-h-[70vh] overflow-y-auto">
                    {/* Checkbox para activar recurrencia */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="recurring-mobile"
                        checked={scheduleData.isRecurring}
                        onChange={(e) =>
                          handleScheduleChange("isRecurring")(e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="recurring-mobile" className="font-medium">
                        Repetir semanalmente
                      </Label>
                    </div>

                    {/* Selector de fecha y hora única */}
                    {!scheduleData.isRecurring && (
                      <div className="flex flex-col gap-2">
                        <Label className="font-medium">Fecha y hora</Label>
                        <DateTimePicker
                          date={scheduleData.datetime}
                          onDateChange={(date) =>
                            handleScheduleChange("datetime")(date)
                          }
                          className={
                            scheduleErrors.datetime ? "border-red-500" : ""
                          }
                          minDate={new Date()}
                        />
                        {scheduleErrors.datetime && (
                          <Label className="text-red-500 text-xs">
                            Campo fecha y hora requerido
                          </Label>
                        )}
                      </div>
                    )}

                    {/* Configuración de recurrencia */}
                    {scheduleData.isRecurring && (
                      <>
                        {/* Selección de días de la semana */}
                        <div className="flex flex-col gap-2">
                          <Label className="font-medium">
                            Días de la semana
                          </Label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { key: "monday", label: "Lun" },
                              { key: "tuesday", label: "Mar" },
                              { key: "wednesday", label: "Mié" },
                              { key: "thursday", label: "Jue" },
                              { key: "friday", label: "Vie" },
                              { key: "saturday", label: "Sáb" },
                              { key: "sunday", label: "Dom" },
                            ].map(({ key, label }) => (
                              <Button
                                key={key}
                                type="button"
                                variant={
                                  scheduleData.selectedDays.includes(key)
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="h-10"
                                onClick={() => handleDayToggle(key)}
                              >
                                {label}
                              </Button>
                            ))}
                          </div>
                          {scheduleErrors.selectedDays && (
                            <Label className="text-red-500 text-xs">
                              Selecciona al menos un día
                            </Label>
                          )}
                        </div>

                        {/* Selección de hora para recurrencia */}
                        <div className="flex flex-col gap-2">
                          <Label className="font-medium">Hora</Label>
                          <Select
                            onValueChange={handleScheduleChange("hour")}
                            value={scheduleData.hour}
                          >
                            <SelectTrigger
                              className={
                                scheduleErrors.hour
                                  ? "border-red-500 w-full"
                                  : "w-full"
                              }
                            >
                              <SelectValue placeholder="HH" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem
                                  key={i}
                                  value={i.toString().padStart(2, "0")}
                                >
                                  {i.toString().padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {scheduleErrors.hour && (
                            <Label className="text-red-500 text-xs">
                              Campo hora requerido
                            </Label>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label className="font-medium">Minutos</Label>
                          <Select
                            onValueChange={handleScheduleChange("minute")}
                            value={scheduleData.minute}
                          >
                            <SelectTrigger
                              className={
                                scheduleErrors.minute
                                  ? "border-red-500 w-full"
                                  : "w-full"
                              }
                            >
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 60 }, (_, i) => (
                                <SelectItem
                                  key={i}
                                  value={i.toString().padStart(2, "0")}
                                >
                                  {i.toString().padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {scheduleErrors.minute && (
                            <Label className="text-red-500 text-xs">
                              Campo minutos requerido
                            </Label>
                          )}
                        </div>
                      </>
                    )}

                    {/* Selección de acción */}
                    <div className="flex flex-col gap-2">
                      <Label className="font-medium">Acción</Label>
                      <Select
                        onValueChange={handleScheduleChange("action")}
                        value={scheduleData.action}
                      >
                        <SelectTrigger
                          className={
                            scheduleErrors.action
                              ? "border-red-500 w-full"
                              : "w-full"
                          }
                        >
                          <SelectValue placeholder="Acción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Encender</SelectItem>
                          <SelectItem value="false">Apagar</SelectItem>
                          <SelectItem value="3">Poner en modo Timer</SelectItem>
                          <SelectItem value="5">
                            Poner en modo Ciclos
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {scheduleErrors.action && (
                        <Label className="text-red-500 text-xs">
                          Campo acción requerido
                        </Label>
                      )}
                    </div>

                    {/* Selección de actuador */}
                    <div className="flex flex-col gap-2">
                      <Label className="font-medium">Actuador</Label>
                      <Select
                        onValueChange={handleScheduleChange("actuator")}
                        value={scheduleData.actuator}
                      >
                        <SelectTrigger
                          className={
                            scheduleErrors.actuator
                              ? "border-red-500 w-full"
                              : "w-full"
                          }
                        >
                          <SelectValue placeholder="Actuador" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDevice?.template?.widgets?.map((widget) => {
                            if (widget.widgetType !== "Switch") return null;
                            return (
                              <SelectItem
                                key={widget.variable}
                                value={widget.variable}
                              >
                                {widget.variableFullName}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {scheduleErrors.actuator && (
                        <Label className="text-red-500 text-xs">
                          Campo actuador requerido
                        </Label>
                      )}
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button
                      onClick={handleCreateScheduled}
                      disabled={!canCreateRules}
                      className={
                        !canCreateRules ? "opacity-50 cursor-not-allowed" : ""
                      }
                    >
                      {hasReachedLimit
                        ? "Límite alcanzado"
                        : "Crear automatización programada"}
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAutomationType(null);
                        }}
                      >
                        Cancelar
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </>
              )}
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog
            open={automationModalOpen}
            onOpenChange={(open) => {
              setAutomationModalOpen(open);
              if (!open) setAutomationType(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {!automationType && "Selecciona el tipo de automatización"}
                  {automationType === "simple" && "Crear automatización simple"}
                  {automationType === "scheduled" &&
                    "Crear automatización programada"}
                </DialogTitle>
                <DialogDescription>
                  {!automationType &&
                    "Elige el tipo de automatización que deseas crear:"}
                  {automationType === "simple" &&
                    "Define una condición y una acción para tu dispositivo."}
                  {automationType === "scheduled" &&
                    "Programa una acción para que se ejecute en una fecha y hora específica, o de forma recurrente."}
                </DialogDescription>
              </DialogHeader>

              {!automationType && (
                <div
                  data-tour="automation-type-selector"
                  className="flex flex-col gap-4 mt-4"
                >
                  <Button
                    variant="outline"
                    className="flex gap-2 justify-start"
                    onClick={() => setAutomationType("simple")}
                  >
                    <Zap className="w-4 h-4" /> Simple (condición y acción)
                  </Button>
                  <Button
                    data-tour="composite-rule-option"
                    variant="outline"
                    className="flex gap-2 justify-start"
                    onClick={() => {
                      setAutomationModalOpen(false);
                      navigate("/automation-editor?create=true");
                    }}
                  >
                    <Network className="w-4 h-4" /> Compuesta (con varias
                    condiciones)
                  </Button>
                  <Button
                    variant="outline"
                    className="flex gap-2 justify-start"
                    onClick={() => setAutomationType("scheduled")}
                  >
                    <Clock className="w-4 h-4" /> Programada (por horario)
                  </Button>
                </div>
              )}

              {/* Simple automation form */}
              {automationType === "simple" && (
                <>
                  <div
                    data-tour="simple-rule-modal"
                    className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4"
                  >
                    <div className="flex flex-col gap-2">
                      <Select
                        onValueChange={handleChange("variable")}
                        value={formData.variable}
                      >
                        <SelectTrigger
                          className={
                            errors.variable ? "border-red-500 w-full" : "w-full"
                          }
                        >
                          <SelectValue placeholder="Variable" />
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
                                {widget.variableFullName}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={handleChange("condition")}
                        value={formData.condition}
                      >
                        <SelectTrigger
                          className={
                            errors.condition
                              ? "border-red-500 w-full"
                              : "w-full"
                          }
                        >
                          <SelectValue placeholder="Condición" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="=">Igual a</SelectItem>
                          <SelectItem value=">=">Mayor que</SelectItem>
                          <SelectItem value="<">Menor que</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.variable && (
                        <Label className="text-red-500">
                          Campo variable requerido
                        </Label>
                      )}
                      {errors.condition && (
                        <Label className="text-red-500">
                          Campo condición requerido
                        </Label>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 align-center justify-center">
                      <Input
                        placeholder="Valor"
                        type="number"
                        className={`mx-auto ${
                          errors.value ? "border-red-500" : ""
                        }`}
                        value={formData.value}
                        onChange={(e) => handleChange("value")(e.target.value)}
                      />
                      {errors.value && (
                        <Label className="text-red-500">Campo requerido</Label>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Select
                        onValueChange={handleChange("action")}
                        value={formData.action}
                      >
                        <SelectTrigger
                          className={
                            errors.action ? "border-red-500 w-full" : "w-full"
                          }
                        >
                          <SelectValue placeholder="Acción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Encender</SelectItem>
                          <SelectItem value="false">Apagar</SelectItem>
                          <SelectItem value="3">Poner en modo Timer</SelectItem>
                          <SelectItem value="5">
                            Poner en modo Ciclos
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={handleChange("actuator")}
                        value={formData.actuator}
                      >
                        <SelectTrigger
                          className={
                            errors.actuator ? "border-red-500 w-full" : "w-full"
                          }
                        >
                          <SelectValue placeholder="Actuador" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDevice?.template?.widgets?.map((widget) => {
                            if (widget.widgetType !== "Switch") return null;
                            return (
                              <SelectItem
                                key={widget.variable}
                                value={widget.variable}
                              >
                                {widget.variableFullName}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {errors.action && (
                        <Label className="text-red-500">
                          Campo acción requerido
                        </Label>
                      )}
                      {errors.actuator && (
                        <Label className="text-red-500">
                          Campo actuador requerido
                        </Label>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full mt-4">
                    <Label className="font-bold">
                      Tiempo entre activaciones: {formData.triggerTime} minutos
                    </Label>
                    <Slider
                      min={10}
                      max={60}
                      step={1}
                      value={[formData.triggerTime]}
                      onValueChange={(value) =>
                        handleChange("triggerTime")(value[0])
                      }
                    />
                    <Label className="text-gray-500 text-left">
                      Ajustá este valor para definir el tiempo que debe pasar
                      entre activaciones una vez sobrepasado el limite. LLegar a
                      un valor ideal para tu equipo hara que el sistema sea mas
                      eficiente.
                    </Label>
                  </div>
                  <DialogFooter className="justify-end mt-4">
                    <Button
                      onClick={handleCreate}
                      disabled={!canCreateRules}
                      className={
                        !canCreateRules ? "opacity-50 cursor-not-allowed" : ""
                      }
                    >
                      {hasReachedLimit
                        ? "Límite alcanzado"
                        : "Crear automatización"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAutomationType(null);
                        setAutomationModalOpen(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Scheduled automation form */}
              {automationType === "scheduled" && (
                <>
                  <div
                    data-tour="scheduled-rule-modal"
                    className="grid grid-cols-1 gap-4 mt-4"
                  >
                    {/* Selector de fecha y hora única */}
                    {!scheduleData.isRecurring && (
                      <div className="flex flex-col gap-2">
                        <Label className="font-medium">Fecha y hora</Label>
                        <DateTimePicker
                          date={scheduleData.datetime}
                          onDateChange={(date) =>
                            handleScheduleChange("datetime")(date)
                          }
                          className={
                            scheduleErrors.datetime ? "border-red-500" : ""
                          }
                          minDate={new Date()}
                        />
                        {scheduleErrors.datetime && (
                          <Label className="text-red-500">
                            Campo fecha y hora requerido
                          </Label>
                        )}
                      </div>
                    )}

                    {/* Checkbox para activar recurrencia */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="recurring"
                        checked={scheduleData.isRecurring}
                        onChange={(e) =>
                          handleScheduleChange("isRecurring")(e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <Label htmlFor="recurring" className="font-medium">
                        Repetir semanalmente
                      </Label>
                    </div>

                    {/* Configuración de recurrencia */}
                    {scheduleData.isRecurring && (
                      <>
                        {/* Selección de días de la semana */}
                        <div className="flex flex-col gap-2">
                          <Label className="font-medium">
                            Días de la semana
                          </Label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { key: "monday", label: "Lun" },
                              { key: "tuesday", label: "Mar" },
                              { key: "wednesday", label: "Mié" },
                              { key: "thursday", label: "Jue" },
                              { key: "friday", label: "Vie" },
                              { key: "saturday", label: "Sáb" },
                              { key: "sunday", label: "Dom" },
                            ].map(({ key, label }) => (
                              <Button
                                key={key}
                                type="button"
                                variant={
                                  scheduleData.selectedDays.includes(key)
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="h-8"
                                onClick={() => handleDayToggle(key)}
                              >
                                {label}
                              </Button>
                            ))}
                          </div>
                          {scheduleErrors.selectedDays && (
                            <Label className="text-red-500">
                              Selecciona al menos un día
                            </Label>
                          )}
                        </div>

                        {/* Selección de hora para recurrencia */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <Label className="font-medium">Hora</Label>
                            <Select
                              onValueChange={handleScheduleChange("hour")}
                              value={scheduleData.hour}
                            >
                              <SelectTrigger
                                className={
                                  scheduleErrors.hour
                                    ? "border-red-500 w-full"
                                    : "w-full"
                                }
                              >
                                <SelectValue placeholder="HH" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem
                                    key={i}
                                    value={i.toString().padStart(2, "0")}
                                  >
                                    {i.toString().padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {scheduleErrors.hour && (
                              <Label className="text-red-500">
                                Campo hora requerido
                              </Label>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Label className="font-medium">Minutos</Label>
                            <Select
                              onValueChange={handleScheduleChange("minute")}
                              value={scheduleData.minute}
                            >
                              <SelectTrigger
                                className={
                                  scheduleErrors.minute
                                    ? "border-red-500 w-full"
                                    : "w-full"
                                }
                              >
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 60 }, (_, i) => (
                                  <SelectItem
                                    key={i}
                                    value={i.toString().padStart(2, "0")}
                                  >
                                    {i.toString().padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {scheduleErrors.minute && (
                              <Label className="text-red-500">
                                Campo minutos requerido
                              </Label>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Selección de acción y actuador */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label className="font-medium">Acción</Label>
                        <Select
                          onValueChange={handleScheduleChange("action")}
                          value={scheduleData.action}
                        >
                          <SelectTrigger
                            className={
                              scheduleErrors.action
                                ? "border-red-500 w-full"
                                : "w-full"
                            }
                          >
                            <SelectValue placeholder="Acción" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Encender</SelectItem>
                            <SelectItem value="false">Apagar</SelectItem>
                            <SelectItem value="3">
                              Poner en modo Timer
                            </SelectItem>
                            <SelectItem value="5">
                              Poner en modo Ciclos
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {scheduleErrors.action && (
                          <Label className="text-red-500">
                            Campo acción requerido
                          </Label>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="font-medium">Actuador</Label>
                        <Select
                          onValueChange={handleScheduleChange("actuator")}
                          value={scheduleData.actuator}
                        >
                          <SelectTrigger
                            className={
                              scheduleErrors.actuator
                                ? "border-red-500 w-full"
                                : "w-full"
                            }
                          >
                            <SelectValue placeholder="Actuador" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedDevice?.template?.widgets?.map(
                              (widget) => {
                                if (widget.widgetType !== "Switch") return null;
                                return (
                                  <SelectItem
                                    key={widget.variable}
                                    value={widget.variable}
                                  >
                                    {widget.variableFullName}
                                  </SelectItem>
                                );
                              }
                            )}
                          </SelectContent>
                        </Select>
                        {scheduleErrors.actuator && (
                          <Label className="text-red-500">
                            Campo actuador requerido
                          </Label>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="justify-end mt-4">
                    <Button
                      onClick={handleCreateScheduled}
                      disabled={!canCreateRules}
                      className={
                        !canCreateRules ? "opacity-50 cursor-not-allowed" : ""
                      }
                    >
                      {hasReachedLimit
                        ? "Límite alcanzado"
                        : "Crear automatización programada"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAutomationType(null);
                        setAutomationModalOpen(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        )}

        {/* Tabla unificada de Reglas y Workflows */}
        <Card className="border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-base px-3 py-1">
                {(rules?.filter((rule) => rule.actionVariable !== "").length ||
                  0) + (workflows?.length || 0)}{" "}
                total
              </Badge>
              <Button
                data-tour="create-rule-btn"
                onClick={() => setAutomationModalOpen(true)}
                variant="default"
                className="flex gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva automatización
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Vista de tabla para desktop */}
            <div data-tour="rules-list" className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Regla / Workflow</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Actuador</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Renderizar workflows */}
                  {workflows?.map((workflow) => (
                    <TableRow key={`workflow-${workflow._id}`}>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 w-fit"
                        >
                          <GitBranch className="w-3 h-3" />
                          Workflow
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Network className="w-4 h-4 text-blue-500" />
                          {workflow.name}
                          <Badge variant="outline" className="text-xs">
                            {workflow.visual?.nodes?.length || 0} nodos
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {workflow.description || "Workflow visual"}
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Badge
                          variant={workflow.enabled ? "default" : "secondary"}
                          className={workflow.enabled ? "bg-green-500" : ""}
                        >
                          {workflow.enabled ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditWorkflow(workflow._id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleWorkflow(workflow)}
                          >
                            {workflow.enabled ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteWorkflow(workflow)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Renderizar reglas tradicionales */}
                  {rules?.map((rule) => {
                    if (rule.actionVariable === "") return null;
                    return (
                      <TableRow key={`rule-${rule._id}`}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 w-fit"
                          >
                            <Zap className="w-3 h-3" />
                            Regla
                          </Badge>
                        </TableCell>
                        <TableCell className="text-left">
                          {formatRule(rule)}
                        </TableCell>
                        <TableCell className="text-left">
                          {formatAction(rule.action)}
                        </TableCell>
                        <TableCell className="text-left">
                          {
                            selectedDevice.template.widgets.find(
                              (x) => x.variable === rule.actionVariable
                            ).variableFullName
                          }
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={rule.status ? "default" : "secondary"}
                          >
                            {rule.status ? "Activa" : "Inactiva"}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-2 justify-end">
                          {rule.type === "composite" ? (
                            <Button
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/automation-editor?ruleId=${rule._id}`
                                )
                              }
                            >
                              Editar
                            </Button>
                          ) : (
                            <UpdateRuleDialog
                              rule={rule}
                              selectedDevice={selectedDevice.template.widgets}
                            />
                          )}
                          <Button
                            variant="outline"
                            onClick={() => handleDelete(rule)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Mensaje cuando no hay elementos */}
                  {(!rules || rules.length === 0) &&
                    (!workflows || workflows.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <GitBranch className="w-12 h-12 opacity-50" />
                            <p>No hay automatizaciones creadas</p>
                            <p className="text-sm">
                              Crea tu primera regla o workflow para automatizar
                              tu dispositivo
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table>
            </div>

            {/* Vista de grid cards para mobile */}
            <div
              data-tour="rules-list"
              className="md:hidden grid grid-cols-1 gap-4"
            >
              {/* Renderizar workflows en cards */}
              {workflows?.map((workflow) => (
                <Card
                  key={`workflow-mobile-${workflow._id}`}
                  className="overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base flex items-center gap-2 text-left mb-2">
                          <Network className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{workflow.name}</span>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground text-left">
                          Workflow creado el{" "}
                          {new Date(
                            workflow.createdAt || Date.now()
                          ).toLocaleDateString("es-ES")}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end shrink-0">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 w-fit"
                        >
                          <GitBranch className="w-3 h-3" />
                          Workflow
                        </Badge>
                        <Badge
                          variant={workflow.enabled ? "default" : "secondary"}
                          className={workflow.enabled ? "bg-green-500" : ""}
                        >
                          {workflow.enabled ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* <div className="text-sm text-muted-foreground text-left">
                      {workflow.description || "Workflow visual"}
                    </div> */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {workflow.visual?.nodes?.length || 0} nodos
                      </Badge>
                    </div>
                    <div className="flex gap-2 flex-wrap pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditWorkflow(workflow._id)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleWorkflow(workflow)}
                      >
                        {workflow.enabled ? (
                          <PowerOff className="w-3 h-3" />
                        ) : (
                          <Power className="w-3 h-3" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWorkflow(workflow)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Renderizar reglas en cards */}
              {rules
                ?.filter((rule) => rule.actionVariable !== "")
                .map((rule) => {
                  const actuatorWidget =
                    selectedDevice?.template?.widgets?.find(
                      (x) => x.variable === rule.actionVariable
                    );

                  return (
                    <Card
                      key={`rule-mobile-${rule._id}`}
                      className="overflow-hidden"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm leading-snug text-left mb-2">
                              {formatRule(rule)}
                            </CardTitle>
                            <div className="text-xs text-muted-foreground text-left">
                              Regla creada el{" "}
                              {new Date(
                                rule.createdAt || Date.now()
                              ).toLocaleDateString("es-ES")}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end shrink-0">
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 w-fit"
                            >
                              <Zap className="w-3 h-3" />
                              Regla
                            </Badge>
                            <Badge
                              variant={rule.status ? "default" : "secondary"}
                            >
                              {rule.status ? "Activa" : "Inactiva"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-col gap-2 text-sm text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">
                              Acción:
                            </span>
                            <span>{formatAction(rule.action)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">
                              Actuador:
                            </span>
                            <span>
                              {actuatorWidget?.variableFullName ||
                                rule.actionVariable}
                            </span>
                          </div>
                          {rule.schedule && (
                            <div className="flex items-center gap-2">
                              <Timer className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {rule.schedule.type === "recurring"
                                  ? `Recurrente: ${
                                      rule.schedule.hour
                                    }:${rule.schedule.minute
                                      .toString()
                                      .padStart(2, "0")}`
                                  : `Única: ${new Date(
                                      rule.schedule.datetime
                                    ).toLocaleString("es-ES")}`}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          {rule.type === "composite" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/automation-editor?ruleId=${rule._id}`
                                )
                              }
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                          ) : (
                            <UpdateRuleDialog
                              rule={rule}
                              selectedDevice={selectedDevice.template.widgets}
                            />
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(rule)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

              {/* Mensaje cuando no hay elementos en mobile */}
              {(!rules ||
                rules.filter((r) => r.actionVariable !== "").length === 0) &&
                (!workflows || workflows.length === 0) && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <GitBranch className="w-16 h-16 opacity-50" />
                        <p className="text-muted-foreground">
                          No hay automatizaciones creadas
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Crea tu primera automatización para empezar
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Reglas existentes (título cambiado, contenido oculto) */}
        <Card style={{ display: "none" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reglas Existentes</CardTitle>
              <Badge variant="outline">
                {currentRulesCount}{" "}
                {currentRulesCount === 1 ? "regla" : "reglas"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regla</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actuador</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules &&
                  rules.map((rule) => {
                    if (rule.actionVariable === "") return null;
                    return (
                      <TableRow key={rule._id}>
                        <TableCell className="text-left">
                          {formatRule(rule)}
                        </TableCell>
                        <TableCell className="text-left">
                          {formatAction(rule.action)}
                        </TableCell>
                        <TableCell className="text-left">
                          {
                            selectedDevice.template.widgets.find(
                              (x) => x.variable === rule.actionVariable
                            ).variableFullName
                          }
                        </TableCell>
                        <TableCell className="flex gap-2 justify-end">
                          {rule.type === "composite" ? (
                            <Button
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/automation-editor?ruleId=${rule._id}`
                                )
                              }
                            >
                              Editar
                            </Button>
                          ) : (
                            <UpdateRuleDialog
                              rule={rule}
                              selectedDevice={selectedDevice.template.widgets}
                            />
                          )}
                          <Button
                            variant="outline"
                            onClick={() => handleDelete(rule)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              {itemToDelete?.type === "workflow" && (
                <>
                  ¿Estás seguro de que deseas eliminar el workflow &quot;
                  {itemToDelete.item.name}&quot;?
                  <br />
                  Esta acción no se puede deshacer y el workflow se eliminará
                  permanentemente.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RuleEngine;
