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

export function NodeEditModal({ node, open, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (node) {
      setFormData(node.data || {});
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      let updatedFormData = { ...formData };

      // Actualizar la condición según el tipo de trigger
      if (node.type === "trigger") {
        if (formData.sensorType === "schedule") {
          // Para triggers de horario
          if (formData.hour && formData.minute) {
            updatedFormData.condition = `${formData.hour.padStart(
              2,
              "0"
            )}:${formData.minute.padStart(2, "0")}`;
          }
        } else {
          // Para triggers de sensores
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${
              formData.value
            }${formData.unidad || ""}`;
          }
        }
      }

      onSave(node.id, updatedFormData);
      onClose();
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Nodo: {node.data?.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Etiqueta</Label>
            <Input
              value={formData.label || ""}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
          </div>
          {node.type === "trigger" && (
            <>
              {/* Trigger de horario */}
              {formData.sensorType === "schedule" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hour">Hora</Label>
                    <Select
                      value={formData.hour?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, hour: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="00" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minute">Minuto</Label>
                    <Select
                      value={formData.minute?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, minute: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="00" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                /* Trigger de sensor */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="comparison">Comparación</Label>
                    <Select
                      value={formData.comparison || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, comparison: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona comparación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">&gt; Mayor que</SelectItem>
                        <SelectItem value="<">&lt; Menor que</SelectItem>
                        <SelectItem value="=">= Igual a</SelectItem>
                        <SelectItem value=">=">&gt;= Mayor o igual</SelectItem>
                        <SelectItem value="<=">&lt;= Menor o igual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      Valor {formData.unidad && `(${formData.unidad})`}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="Ingresa el valor"
                      value={formData.value || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {node.type === "condition" && (
            <div>
              <Label>Condición</Label>
              <Input
                value={formData.condition || ""}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
              />
            </div>
          )}
          {node.type === "action" && (
            <div>
              <Label>Acción</Label>
              <Select
                value={formData.action || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, action: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Encender">Encender</SelectItem>
                  <SelectItem value="Apagar">Apagar</SelectItem>
                  <SelectItem value="Toggle">Alternar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Guardar</Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

NodeEditModal.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    data: PropTypes.object,
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
