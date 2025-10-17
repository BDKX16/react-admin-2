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

export function NodeEditModal({ node, open, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (node) {
      setFormData(node.data || {});
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onSave(node.id, formData);
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
            <div>
              <Label>Valor del Trigger</Label>
              <Input
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
            </div>
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
