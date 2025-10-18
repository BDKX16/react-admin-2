import { useCallback, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Thermometer, Zap, GitBranch, Play, Save } from "lucide-react";
import { TriggerNode } from "@/components/automation/trigger-node.jsx";
import { ConditionNode } from "@/components/automation/condition-node.jsx";
import { ActionNode } from "@/components/automation/action-node.jsx";
import { NodePaletteSidebar } from "@/components/automation/NodePaletteSidebar.jsx";
import { NodeEditModal } from "@/components/automation/node-edit-modal.jsx";
import { SimulationConfigModal } from "@/components/automation/simulation-config-modal.jsx";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { saveWorkflow, getWorkflow } from "@/services/workflow.js";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import useDevices from "@/hooks/useDevices";

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
};

const initialNodes = [
  {
    id: "1",
    type: "trigger",
    position: { x: 250, y: 100 },
    data: {
      label: "Sensor de Temperatura",
      icon: Thermometer,
      sensorType: "temperature",
      value: "> 22°C",
    },
  },
];

const initialEdges = [];

function NodeWorkspaceContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimConfigOpen, setIsSimConfigOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowId, setWorkflowId] = useState(null);
  const [workflowName, setWorkflowName] = useState("Mi Workflow");
  const [simulationConfig, setSimulationConfig] = useState({
    temperature: 25,
    humidity: 60,
    soilMoisture: 50,
    co2: 400,
    ph: 7.0,
    hour: 14,
    minute: 30,
    season: "spring",
  });

  // Hook del sidebar para controlar su estado
  const { setOpen } = useSidebar();

  // Hook de ReactFlow para obtener viewport
  const reactFlowInstance = useReactFlow();

  // Hook para obtener dispositivo seleccionado
  const { selectedDevice } = useDevices();

  // Obtener parámetros de URL para cargar workflow existente
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  // Cargar workflow existente si hay ID en la URL
  useEffect(() => {
    const loadWorkflow = async () => {
      if (editId) {
        try {
          const response = await getWorkflow(editId);
          if (response.success) {
            const workflowData = response.data;
            setWorkflowId(editId);
            setWorkflowName(workflowData.name);
            setNodes(
              workflowData.visual_data?.nodes || workflowData.nodes || []
            );
            setEdges(
              workflowData.visual_data?.edges || workflowData.edges || []
            );

            // Restaurar viewport si existe y reactFlowInstance está disponible
            if (workflowData.visual_data?.viewport && reactFlowInstance) {
              const { x, y, zoom } = workflowData.visual_data.viewport;
              // Usar setTimeout para asegurar que ReactFlow esté completamente montado
              setTimeout(() => {
                try {
                  reactFlowInstance.setViewport({ x, y, zoom });
                } catch (error) {
                  console.warn("No se pudo restaurar el viewport:", error);
                }
              }, 100);
            }

            console.log(
              `Workflow "${workflowData.name}" cargado correctamente`
            );
          }
        } catch (error) {
          console.error("Error cargando workflow:", error);
          alert("Error cargando el workflow");
        }
      }
    };

    loadWorkflow();
  }, [editId, setNodes, setEdges, reactFlowInstance]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeDoubleClick = useCallback((_, node) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  }, []);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const handleSaveNode = useCallback(
    (nodeId, data) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...data } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const addNode = useCallback(
    (type, nodeData) => {
      const newNode = {
        id: `${nodes.length + 1}`,
        type,
        position: {
          x: Math.random() * 400 + 100,
          y: Math.random() * 400 + 100,
        },
        data: nodeData,
      };
      setNodes((nds) => [...nds, newNode]);
      // Colapsar el sidebar después de agregar un nodo
      setOpen(false);
    },
    [nodes.length, setNodes, setOpen]
  );

  // Función para manejar clics en el panel del ReactFlow
  const onPaneClick = useCallback(() => {
    // Colapsar el sidebar cuando se hace clic en el canvas
    setOpen(false);
  }, [setOpen]);

  const executeSimulation = useCallback(
    (config) => {
      if (isSimulating) return;

      setIsSimulating(true);
      console.log("[v0] Starting simulation with config:", config);

      // Find all trigger nodes (starting points)
      const triggerNodes = nodes.filter((n) => n.type === "trigger");
      if (triggerNodes.length === 0) {
        console.log("[v0] No trigger nodes found");
        setIsSimulating(false);
        return;
      }

      // Build execution path by following edges
      const buildExecutionPath = (startNodeId) => {
        const path = [startNodeId];
        const visited = new Set([startNodeId]);

        const traverse = (nodeId) => {
          const outgoingEdges = edges.filter((e) => e.source === nodeId);
          for (const edge of outgoingEdges) {
            if (!visited.has(edge.target)) {
              visited.add(edge.target);
              path.push(edge.target);
              traverse(edge.target);
            }
          }
        };

        traverse(startNodeId);
        return path;
      };

      // Execute each trigger's path
      triggerNodes.forEach((triggerNode, triggerIndex) => {
        const executionPath = buildExecutionPath(triggerNode.id);
        console.log("[v0] Execution path:", executionPath);

        // Animate through the path
        executionPath.forEach((nodeId, index) => {
          setTimeout(() => {
            setNodes((nds) =>
              nds.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  isExecuting: node.id === nodeId,
                },
              }))
            );

            // Clear execution state after animation
            if (index === executionPath.length - 1) {
              setTimeout(() => {
                setNodes((nds) =>
                  nds.map((node) => ({
                    ...node,
                    data: {
                      ...node.data,
                      isExecuting: false,
                    },
                  }))
                );
                if (triggerIndex === triggerNodes.length - 1) {
                  setIsSimulating(false);
                  console.log("[v0] Simulation complete");
                }
              }, 1000);
            }
          }, triggerIndex * executionPath.length * 1000 + index * 1000);
        });
      });
    },
    [nodes, edges, isSimulating, setNodes]
  );

  const handleExecuteClick = () => {
    setIsSimConfigOpen(true);
  };

  // Función para guardar el workflow
  const handleSaveWorkflow = async () => {
    try {
      setIsSaving(true);

      // Obtener el estado actual del viewport
      const viewport = reactFlowInstance
        ? reactFlowInstance.getViewport()
        : { x: 0, y: 0, zoom: 1 };

      const workflowData = {
        id: workflowId,
        name: workflowName,
        description: `Workflow creado el ${new Date().toLocaleDateString()}`,
        nodes,
        edges,
        viewport,
        enabled: true,
        deviceId: selectedDevice?.dId || null, // Agregar deviceId del dispositivo seleccionado
      };

      const response = await saveWorkflow(workflowData);

      if (response.success) {
        if (!workflowId) {
          // Nuevo workflow creado
          setWorkflowId(response.data.workflowId);
          alert(`Workflow "${workflowName}" creado y guardado en Node-RED`);
        } else {
          // Workflow actualizado
          alert(`Workflow "${workflowName}" actualizado en Node-RED`);
        }
      }
    } catch (error) {
      console.error("Error guardando workflow:", error);
      alert("Error guardando el workflow");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-background">
      {/* Main Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.3,
            minZoom: 0.5,
            maxZoom: 1.5,
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          proOptions={{ hideAttribution: true }}
          className="bg-background"
          defaultEdgeOptions={{
            style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
            type: "smoothstep",
          }}
        >
          <Background
            color="hsl(var(--border))"
            gap={16}
            size={1}
            className="bg-background"
          />
          <Controls
            className="bg-card border border-border rounded-lg shadow-lg [&>button]:bg-background [&>button]:border-border [&>button]:text-foreground hover:[&>button]:bg-accent hover:[&>button]:text-accent-foreground"
            showInteractive={false}
          />
          <MiniMap
            className="bg-card border border-border rounded-lg shadow-lg [&>svg]:bg-background mr-0"
            maskColor="hsl(var(--background))"
            backgroundColor="hsl(var(--background))"
            pannable={true}
            zoomable={true}
            nodeColor={(node) => {
              if (node.type === "trigger") return "rgb(59 130 246)"; // blue-500
              if (node.type === "condition") return "rgb(234 179 8)"; // yellow-500
              if (node.type === "action") return "rgb(34 197 94)"; // green-500
              return "hsl(var(--muted))";
            }}
            nodeStrokeColor="hsl(var(--border))"
            nodeStrokeWidth={1}
          />

          <Panel position="top-right" className="flex gap-2">
            <Button
              size="sm"
              className="gap-2"
              onClick={handleSaveWorkflow}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={handleExecuteClick}
              disabled={isSimulating}
            >
              {isSimulating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Simulando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Simular
                </>
              )}
            </Button>
          </Panel>

          <Panel position="top-left">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none outline-none focus:underline min-w-0"
                  placeholder="Nombre del workflow"
                />
                {workflowId && (
                  <Badge variant="secondary" className="text-xs">
                    ID: {workflowId.substring(0, 8)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Thermometer className="h-3 w-3" />
                    {nodes.filter((n) => n.type === "trigger").length} Triggers
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <GitBranch className="h-3 w-3" />
                    {nodes.filter((n) => n.type === "condition").length}{" "}
                    Condiciones
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {nodes.filter((n) => n.type === "action").length} Acciones
                  </Badge>
                </div>
              </div>
            </Card>
          </Panel>
        </ReactFlow>
      </div>

      {/* Node Palette Sidebar */}
      <NodePaletteSidebar onAddNode={addNode} />

      {/* NodeEditModal component */}
      <NodeEditModal
        node={selectedNode}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNode}
      />

      <SimulationConfigModal
        open={isSimConfigOpen}
        onClose={() => setIsSimConfigOpen(false)}
        onStart={executeSimulation}
        currentConfig={simulationConfig}
      />
    </div>
  );
}

// Componente principal que envuelve con SidebarProvider y ReactFlowProvider
export default function NodeWorkspace() {
  return (
    <ReactFlowProvider>
      <SidebarProvider defaultOpen={true}>
        <NodeWorkspaceContent />
      </SidebarProvider>
    </ReactFlowProvider>
  );
}
