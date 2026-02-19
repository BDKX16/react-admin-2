// Este archivo contiene los componentes mobile para RuleEngine
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Zap,
  GitBranch,
  Trash2,
  Edit,
  Network,
  Clock,
  Monitor,
  Power,
  PowerOff,
  Timer,
} from "lucide-react";

// Componente para el selector de tipo de automatización en mobile
export const MobileAutomationTypeSelector = ({
  onSelectSimple,
  onSelectScheduled,
  onClose,
}) => {
  return (
    <div>
      <DrawerHeader>
        <DrawerTitle>Selecciona el tipo de automatización</DrawerTitle>
        <DrawerDescription>
          Elige el tipo de automatización que deseas crear:
        </DrawerDescription>
      </DrawerHeader>
      <div className="flex flex-col gap-4 p-4">
        <Button
          variant="outline"
          className="flex gap-3 justify-start h-auto py-4"
          onClick={onSelectSimple}
        >
          <Zap className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col items-start">
            <span className="font-semibold">Simple</span>
            <span className="text-xs text-muted-foreground">
              Condición y acción
            </span>
          </div>
        </Button>
        <Button
          variant="outline"
          className="flex gap-3 justify-start h-auto py-4"
          onClick={onSelectScheduled}
        >
          <Clock className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col items-start">
            <span className="font-semibold">Programada</span>
            <span className="text-xs text-muted-foreground">Por horario</span>
          </div>
        </Button>
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-4 flex gap-3">
            <Monitor className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">Automatización Compuesta</p>
                <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-500">
                  Experimental
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Para crear automatizaciones avanzadas, accede desde una
                computadora.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <DrawerFooter>
        <DrawerClose asChild>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </div>
  );
};

// Componente para mostrar automatizaciones en formato grid/card para mobile
export const MobileAutomationGrid = ({
  workflows,
  rules,
  selectedDevice,
  onEditWorkflow,
  onDeleteWorkflow,
  onToggleWorkflow,
  onEditRule,
  onDeleteRule,
  formatRule,
  formatAction,
}) => {
  const allAutomations = [
    ...workflows.map((w) => ({ ...w, type: "workflow" })),
    ...rules
      .filter((r) => r.actionVariable !== "")
      .map((r) => ({ ...r, type: "rule" })),
  ];

  if (allAutomations.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {allAutomations.map((item) => {
        if (item.type === "workflow") {
          return (
            <Card key={`workflow-${item._id}`} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 w-fit"
                      >
                        <GitBranch className="w-3 h-3" />
                        Workflow
                      </Badge>
                      <Badge
                        variant={item.enabled ? "default" : "secondary"}
                        className={item.enabled ? "bg-green-500" : ""}
                      >
                        {item.enabled ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Network className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {item.description || "Workflow visual"}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.visual?.nodes?.length || 0} nodos
                  </Badge>
                </div>
                <div className="flex gap-2 flex-wrap pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEditWorkflow(item._id)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleWorkflow(item)}
                  >
                    {item.enabled ? (
                      <PowerOff className="w-3 h-3" />
                    ) : (
                      <Power className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteWorkflow(item)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        } else {
          // Es una regla
          const actuatorWidget = selectedDevice?.template?.widgets?.find(
            (x) => x.variable === item.actionVariable
          );

          return (
            <Card key={`rule-${item._id}`} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 w-fit"
                      >
                        <Zap className="w-3 h-3" />
                        Regla
                      </Badge>
                      <Badge variant={item.status ? "default" : "secondary"}>
                        {item.status ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm leading-snug">
                      {formatRule(item)}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">
                      Acción:
                    </span>
                    <span>{formatAction(item.action)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">
                      Actuador:
                    </span>
                    <span>
                      {actuatorWidget?.variableFullName || item.actionVariable}
                    </span>
                  </div>
                  {item.schedule && (
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {item.schedule.type === "recurring"
                          ? `Recurrente: ${
                              item.schedule.hour
                            }:${item.schedule.minute
                              .toString()
                              .padStart(2, "0")}`
                          : `Única: ${new Date(
                              item.schedule.datetime
                            ).toLocaleString("es-ES")}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEditRule(item)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteRule(item)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        }
      })}
    </div>
  );
};
