import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export function ConditionNodeModal({ node, open, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (node) {
      setFormData({
        ...node.data,
        comparison: node.data.comparison || ">=",
        value: node.data.value || "",
        condition: node.data.condition || "",
      });
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;

    let updatedFormData = { ...formData };

    // Configurar la condición según el tipo
    if (node.data?.conditionType) {
      switch (node.data.conditionType) {
        case "solar":
          // Amanecer/Atardecer
          updatedFormData.condition = formData.solarEvent || "amanecer";
          break;
        case "dayNight":
          // Día/Noche
          updatedFormData.condition = formData.dayNightCycle || "día";
          break;
        case "season":
          // Estación
          updatedFormData.condition = formData.season || "primavera";
          break;
        case "rainForecast":
          // Pronóstico de lluvia - necesita comparación y valor
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}%`;
          }
          break;
        case "frostRisk":
          // Riesgo de helada - temperatura mínima
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}°C`;
          }
          break;
        case "heatIndex":
          // Índice de calor
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}°C`;
          }
          break;
        case "dewPoint":
          // Punto de rocío
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}°C`;
          }
          break;
        case "daylightHours":
          // Horas de luz
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}h`;
          }
          break;
        case "waterDeficit":
          // Déficit hídrico
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}mm`;
          }
          break;
        default:
          // Para otros tipos de condiciones
          break;
      }
    }

    onSave({
      ...node,
      data: updatedFormData,
    });
  };

  const renderConditionInputs = () => {
    if (!node?.data?.conditionType) return null;

    switch (node.data.conditionType) {
      case "solar":
        return (
          <div className="space-y-2">
            <Label>Evento Solar</Label>
            <Select
              value={formData.solarEvent || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, solarEvent: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amanecer">Amanecer</SelectItem>
                <SelectItem value="atardecer">Atardecer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "dayNight":
        return (
          <div className="space-y-2">
            <Label>Ciclo</Label>
            <Select
              value={formData.dayNightCycle || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, dayNightCycle: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ciclo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="día">Día</SelectItem>
                <SelectItem value="noche">Noche</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "season":
        return (
          <div className="space-y-2">
            <Label>Estación</Label>
            <Select
              value={formData.season || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, season: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primavera">Primavera</SelectItem>
                <SelectItem value="verano">Verano</SelectItem>
                <SelectItem value="otoño">Otoño</SelectItem>
                <SelectItem value="invierno">Invierno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "rainForecast":
      case "frostRisk":
      case "heatIndex":
      case "dewPoint":
      case "daylightHours":
      case "waterDeficit":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Comparación</Label>
              <Select
                value={formData.comparison || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, comparison: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=">">Mayor que (&gt;)</SelectItem>
                  <SelectItem value=">=">Mayor o igual (&gt;=)</SelectItem>
                  <SelectItem value="<">Menor que (&lt;)</SelectItem>
                  <SelectItem value="<=">Menor o igual (&lt;=)</SelectItem>
                  <SelectItem value="=">Igual (=)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor {getUnitLabel(node.data.conditionType)}</Label>
              <Input
                type="number"
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="Ingrese valor"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label>Condición</Label>
            <Input
              value={formData.condition || ""}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              placeholder="Configurar condición"
            />
          </div>
        );
    }
  };

  const getUnitLabel = (conditionType) => {
    switch (conditionType) {
      case "rainForecast":
        return "(%)";
      case "frostRisk":
      case "heatIndex":
      case "dewPoint":
        return "(°C)";
      case "daylightHours":
        return "(horas)";
      case "waterDeficit":
        return "(mm)";
      default:
        return "";
    }
  };

  const isValidForm = () => {
    if (!node?.data?.conditionType) return false;

    switch (node.data.conditionType) {
      case "solar":
        return !!formData.solarEvent;
      case "dayNight":
        return !!formData.dayNightCycle;
      case "season":
        return !!formData.season;
      case "rainForecast":
      case "frostRisk":
      case "heatIndex":
      case "dewPoint":
      case "daylightHours":
      case "waterDeficit":
        return !!(formData.comparison && formData.value);
      default:
        return !!formData.condition;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Configurar {node?.data?.label || "Condición"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Etiqueta del Nodo</Label>
            <Input
              id="label"
              value={formData.label || ""}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder="Nombre del nodo"
            />
          </div>

          {renderConditionInputs()}

          {formData.condition && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Condición configurada:</p>
              <p className="text-sm text-muted-foreground">
                {formData.condition}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!isValidForm()}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

ConditionNodeModal.propTypes = {
  node: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
