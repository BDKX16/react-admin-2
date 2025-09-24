import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Crown, Sparkles } from "lucide-react";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { Slider } from "@/components/ui/slider";
import useDevices from "../hooks/useDevices";
import useSubscription from "../hooks/useSubscription";
import UpdateRuleDialog from "@/components/UpdateRuleDialog";

import { createRule, deleteRule } from "../services/public";

const RuleEngine = () => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const { selectedDevice } = useDevices();
  const { planData, isPro, isPlus } = useSubscription();
  const [rules, setRules] = useState([]);

  // Obtener límites del plan
  const maxRules = planData?.planLimits?.maxRules || 0;
  const currentRulesCount = rules?.length || 0;
  const hasReachedLimit = maxRules !== -1 && currentRulesCount >= maxRules;
  const canCreateRules = maxRules === -1 || currentRulesCount < maxRules;

  useEffect(() => {
    setRules(
      selectedDevice?.alarmRules?.sort((a, b) =>
        b.variableFullName.localeCompare(a.variableFullName)
      )
    );
  }, [selectedDevice]);

  const [formData, setFormData] = useState({
    variable: "",
    condition: "",
    value: "",
    action: "",
    actuator: "",
    triggerTime: 20,
  });

  const [errors, setErrors] = useState({
    variable: false,
    condition: false,
    value: false,
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

    const alarmRule = {
      dId: selectedDevice.dId,
      status: true,
      variableFullName: formData.variable,
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

  const handleDelete = async (ruleId) => {
    const res = await callEndpoint(deleteRule(ruleId));

    if (!res.error) {
      setRules((prevRules) =>
        prevRules.filter((rule) => rule.emqxRuleId !== ruleId)
      );
    }
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
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-2 text-left">Control Automatico</h1>

      <div className="w-full max-w-3xl">
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-left">Agregar Nueva Regla</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={hasReachedLimit ? "destructive" : "secondary"}>
                  {maxRules === -1
                    ? "Ilimitadas"
                    : `${currentRulesCount}/${maxRules}`}
                </Badge>
                {(isPro || isPlus) && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {isPro ? (
                      <Crown className="w-3 h-3" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {isPro ? "Pro" : "Plus"}
                  </Badge>
                )}
              </div>
            </div>
            <Label className="mb-4 text-left text-gray-500">
              Aca podes crear reglas para automatizar acciones basadas en
              condiciones específicas.
            </Label>
            {hasReachedLimit && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  Has alcanzado el límite de {maxRules} reglas para tu plan
                  actual.
                  {!isPro &&
                    !isPlus &&
                    " Actualiza a Plus o Pro para crear más reglas."}
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Select onValueChange={handleChange("variable")}>
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

                <Select onValueChange={handleChange("condition")}>
                  <SelectTrigger
                    className={
                      errors.condition ? "border-red-500 w-full" : "w-full"
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
                    Campo condicion requerido
                  </Label>
                )}
              </div>
              <div className="flex flex-col gap-2 align-center justify-center">
                <Input
                  placeholder="Valor"
                  type="number"
                  className={`mx-auto ${errors.value ? "border-red-500" : ""}`}
                  value={formData.value}
                  onChange={(e) => handleChange("value")(e.target.value)}
                />
                {errors.value && (
                  <Label className="text-red-500">Campo requerido</Label>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Select onValueChange={handleChange("action")}>
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
                    <SelectItem value="5">Poner en modo Ciclos</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={handleChange("actuator")}>
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
                  <Label className="text-red-500">Campo acción requerido</Label>
                )}
                {errors.actuator && (
                  <Label className="text-red-500">
                    Campo actuador requerido
                  </Label>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Label className="font-bold">
                Tiempo entre activaciones: {formData.triggerTime} minutos
              </Label>
              <Slider
                min={10}
                max={60}
                step={1}
                value={[formData.triggerTime]}
                onValueChange={(value) => handleChange("triggerTime")(value[0])}
              />
              <Label className="text-gray-500 text-left">
                Ajustá este valor para definir el tiempo que debe pasar entre
                activaciones una vez sobrepasado el limite. LLegar a un valor
                ideal para tu equipo hara que el sistema sea mas eficiente.
              </Label>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={handleCreate}
              disabled={!canCreateRules}
              className={!canCreateRules ? "opacity-50 cursor-not-allowed" : ""}
            >
              {hasReachedLimit ? "Límite alcanzado" : "Add Rule"}
            </Button>
          </CardFooter>
        </Card>
        <Card>
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
                          <UpdateRuleDialog
                            rule={rule}
                            selectedDevice={selectedDevice.template.widgets}
                          />
                          <Button
                            variant="outline"
                            onClick={() => handleDelete(rule.emqxRuleId)}
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
    </div>
  );
};

export default RuleEngine;
