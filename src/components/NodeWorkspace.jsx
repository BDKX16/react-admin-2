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
import { DelayNode } from "@/components/automation/delay-node.jsx";
import { JoinNode } from "@/components/automation/join-node.jsx";
import { NodePaletteSidebar } from "@/components/automation/NodePaletteSidebar.jsx";
import { NodeEditModal } from "@/components/automation/node-edit-modal.jsx";
import { SimulationConfigModal } from "@/components/automation/simulation-config-modal.jsx";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { saveWorkflow, getWorkflow } from "@/services/workflow.js";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import useDevices from "@/hooks/useDevices";
import useAuth from "@/hooks/useAuth";

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  delay: DelayNode,
  join: JoinNode,
};

// Función para mapear iconos de widgets a componentes Lucide (simplificada)
const getWidgetIcon = (iconName) => {
  const iconMap = {
    thermometer: Thermometer,
    // Para otros iconos, usar los ya importados como fallback
  };

  return iconMap[iconName] || Thermometer; // Thermometer como fallback
};

// Función para generar nodos iniciales basados en el dispositivo seleccionado
const generateInitialNodes = (selectedDevice) => {
  if (!selectedDevice?.template?.widgets) {
    // Nodo por defecto si no hay dispositivo o template
    return [
      {
        id: "1",
        type: "trigger",
        position: { x: 250, y: 100 },
        data: {
          label: "Sensor de Temperatura",
          icon: Thermometer,
          sensorType: "temperature",
          value: "> 22",
        },
      },
    ];
  }

  // Filtrar widgets de tipo "Indicator" para sensores
  const indicatorWidgets = selectedDevice.template.widgets.filter(
    (widget) => widget.widgetType === "Indicator" && widget.sensor === true
  );

  if (indicatorWidgets.length === 0) {
    // Si no hay indicators, usar el primer widget
    const firstWidget = selectedDevice.template.widgets[0];
    return [
      {
        id: "1",
        type: "trigger",
        position: { x: 250, y: 100 },
        data: {
          label: firstWidget.name || firstWidget.variableFullName || "Trigger",
          icon: getWidgetIcon(firstWidget.icon),
          sensorType: firstWidget.variable,
          variable: firstWidget.variable,
          variableFullName: firstWidget.name,
          unidad: firstWidget.unidad,
          dId: selectedDevice.dId,
        },
      },
    ];
  }

  // Usar el primer widget indicator
  const firstIndicator = indicatorWidgets[0];
  return [
    {
      id: "1",
      type: "trigger",
      position: { x: 250, y: 100 },
      data: {
        label: `Sensor ${
          firstIndicator.name || firstIndicator.variableFullName
        }`,
        icon: getWidgetIcon(firstIndicator.icon),
        sensorType: firstIndicator.variable,
        variable: firstIndicator.variable,
        variableFullName: firstIndicator.name,
        unidad: firstIndicator.unidad,
        dId: selectedDevice.dId,
      },
    },
  ];
};

const initialNodes = [];

const initialEdges = [];

function NodeWorkspaceContent({ userId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimConfigOpen, setIsSimConfigOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [workflowId, setWorkflowId] = useState(null);
  const [workflowName, setWorkflowName] = useState("Mi Workflow");
  const [validationErrors, setValidationErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [simulationConfig, setSimulationConfig] = useState({});

  // Hook del sidebar para controlar su estado
  const { setOpen } = useSidebar();

  // Hook de ReactFlow para obtener viewport
  const reactFlowInstance = useReactFlow();

  // Hook para obtener dispositivo seleccionado y usuario
  const { selectedDevice } = useDevices();
  const { auth } = useAuth();

  // Hook para navegación
  const navigate = useNavigate();

  // Hook para toasts
  const { toast } = useToast();

  // Función para determinar si el usuario es pro
  const isProUser = auth?.userData?.plan && auth.userData.plan !== "free";

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

  // Limpiar clases de validación cuando showValidation se vuelve false
  useEffect(() => {
    if (!showValidation) {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          className: "",
          data: {
            ...node.data,
            validationState: undefined,
          },
        }))
      );
    }
  }, [showValidation, setNodes]);

  const onConnect = useCallback(
    (params) => {
      // Validaciones de conexiones
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      // Validación 1: No permitir conexión de un nodo a sí mismo
      if (params.source === params.target) {
        toast({
          description: "No puedes conectar un nodo consigo mismo",
        });
        return;
      }

      // Validación 2: No permitir ciclos infinitos
      const wouldCreateCycle = (sourceId, targetId, currentEdges) => {
        const visited = new Set();
        const queue = [targetId];

        while (queue.length > 0) {
          const current = queue.shift();
          if (current === sourceId) return true;
          if (visited.has(current)) continue;
          visited.add(current);

          currentEdges.forEach((edge) => {
            if (edge.source === current) {
              queue.push(edge.target);
            }
          });
        }
        return false;
      };

      if (wouldCreateCycle(params.source, params.target, edges)) {
        toast({
          description: "Esta conexión crearía un ciclo infinito",
        });
        return;
      }

      // Validación 3: Nodos Join solo permiten una conexión por entrada
      if (targetNode && targetNode.type === "join") {
        const existingConnection = edges.find(
          (edge) =>
            edge.target === params.target &&
            edge.targetHandle === params.targetHandle
        );

        if (existingConnection) {
          const handleName =
            params.targetHandle === "input-top" ? "superior" : "inferior";
          toast({
            description: `La entrada ${handleName} del Join ya tiene una conexión`,
          });
          return;
        }

        // Validación 3.1: No permitir el mismo nodo en ambas entradas del Join
        const otherHandle =
          params.targetHandle === "input-top" ? "input-bottom" : "input-top";
        const sameNodeOtherInput = edges.find(
          (edge) =>
            edge.target === params.target &&
            edge.targetHandle === otherHandle &&
            edge.source === params.source
        );

        if (sameNodeOtherInput) {
          toast({
            description:
              "No puedes conectar el mismo nodo a ambas entradas del Join",
          });
          return;
        }
      }

      // Validación 4: Los triggers no pueden tener entradas
      if (targetNode && targetNode.type === "trigger") {
        toast({
          description: "Los nodos trigger no pueden recibir conexiones",
        });
        return;
      }

      // Validación 5: Las acciones deben tener exactamente una entrada
      if (targetNode && targetNode.type === "action") {
        const existingConnection = edges.find(
          (edge) => edge.target === params.target
        );
        if (existingConnection) {
          toast({
            description:
              "Los nodos action solo pueden tener una conexión de entrada",
          });
          return;
        }
      }

      // Validación 6: Los nodos de comparación solo pueden tener una entrada
      if (targetNode && targetNode.type === "condition") {
        const existingConnection = edges.find(
          (edge) => edge.target === params.target
        );
        if (existingConnection) {
          toast({
            description:
              "Los nodos de comparación solo pueden tener una conexión de entrada",
          });
          return;
        }
      }

      // Si pasa todas las validaciones, agregar la conexión
      setEdges((eds) => addEdge(params, eds));

      // Actualizar el nodo condition con la variable del trigger conectado
      if (targetNode && targetNode.type === "condition" && sourceNode) {
        // Extraer la variable del nodo fuente
        let sourceVariable = null;
        let sourceVariableFullName = null;

        if (sourceNode.type === "trigger") {
          sourceVariable =
            sourceNode.data?.variable || sourceNode.data?.sensorType;
          sourceVariableFullName =
            sourceNode.data?.variableFullName || sourceNode.data?.label;
        } else if (sourceNode.type === "action") {
          sourceVariable =
            sourceNode.data?.actuator || sourceNode.data?.targetWidget;
          sourceVariableFullName = sourceNode.data?.label;
        } else if (
          sourceNode.type === "condition" ||
          sourceNode.type === "join"
        ) {
          sourceVariable = sourceNode.data?.variable;
          sourceVariableFullName = sourceNode.data?.variableFullName;
        }

        // Actualizar el nodo condition con la variable detectada
        if (sourceVariable) {
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === params.target) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    variable: sourceVariable,
                    variableFullName: sourceVariableFullName,
                  },
                };
              }
              return node;
            })
          );
        }
      }
    },
    [setEdges, edges, nodes, toast, setNodes]
  );

  const onNodeDoubleClick = useCallback((_, node) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  }, []);

  const onNodeClick = useCallback(
    (_, node) => {
      // Actualizar el estado de selección
      setSelectedNode(node);

      // Marcar visualmente todos los nodos
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === node.id,
          data: {
            ...n.data,
            isSelected: n.id === node.id,
          },
        }))
      );
    },
    [setNodes]
  );

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

  // Función para eliminar un nodo y sus conexiones
  const deleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      // Limpiar selección si se borra el nodo seleccionado
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [setNodes, setEdges, selectedNode]
  );

  // Función para abrir el modal de edición del nodo seleccionado
  const openSelectedNodeModal = useCallback(() => {
    if (selectedNode) {
      setIsModalOpen(true);
    }
  }, [selectedNode]);

  // Manejar acciones de teclado
  const handleKeyDown = useCallback(
    (event) => {
      // Solo procesar si no hay un input activo
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (event.key) {
        case "Delete":
        case "Backspace":
          if (selectedNode) {
            event.preventDefault();
            deleteNode(selectedNode.id);
          }
          break;
        case "Enter":
          if (selectedNode) {
            event.preventDefault();
            openSelectedNodeModal();
          }
          break;
        case "Escape":
          event.preventDefault();
          setSelectedNode(null);
          // Deseleccionar visualmente todos los nodos
          setNodes((nds) =>
            nds.map((n) => ({
              ...n,
              selected: false,
              data: {
                ...n.data,
                isSelected: false,
              },
            }))
          );
          break;
        default:
          break;
      }
    },
    [selectedNode, deleteNode, openSelectedNodeModal, setNodes]
  );

  // Agregar event listener para las acciones de teclado
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Función para manejar clics en el panel del ReactFlow
  const onPaneClick = useCallback(() => {
    // Colapsar el sidebar cuando se hace clic en el canvas
    setOpen(false);

    // Deseleccionar todos los nodos
    setSelectedNode(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        selected: false,
        data: {
          ...n.data,
          isSelected: false,
        },
      }))
    );
  }, [setOpen, setNodes]);

  const executeSimulation = (config) => {
    if (isSimulating) return;

    setIsSimulating(true);

    // Función auxiliar para evaluar una condición
    const evaluateCondition = (node, config) => {
      if (!node) return false;

      const { comparison, value, variable, comparisonValue } = node.data;

      // Buscar el valor simulado por ID del widget
      let simulatedValue = null;
      if (config[variable]) {
        simulatedValue = config[variable].value;
      } else {
        simulatedValue = parseFloat(value) || 0;
      }

      const targetValue = parseFloat(comparisonValue || value);

      // Evaluar la comparación
      let result;
      switch (comparison) {
        case ">":
          result = simulatedValue > targetValue;
          break;
        case "<":
          result = simulatedValue < targetValue;
          break;
        case ">=":
          result = simulatedValue >= targetValue;
          break;
        case "<=":
          result = simulatedValue <= targetValue;
          break;
        case "==":
        case "===":
          result = simulatedValue === targetValue;
          break;
        case "!=":
        case "!==":
          result = simulatedValue !== targetValue;
          break;
        default:
          result = false;
      }

      return result;
    };

    // Función auxiliar para evaluar un nodo join
    const evaluateJoin = (node, config) => {
      if (!node) return false;

      const {
        joinMode,
        topInputVariable,
        topComparison,
        topComparisonValue,
        bottomInputVariable,
        bottomComparison,
        bottomComparisonValue,
      } = node.data;

      // Obtener las conexiones de entrada al JOIN
      const incomingEdges = edges.filter((e) => e.target === node.id);
      const topEdge = incomingEdges.find((e) => e.targetHandle === "input-top");
      const bottomEdge = incomingEdges.find(
        (e) => e.targetHandle === "input-bottom"
      );

      // Función para obtener el valor simulado según el ID del widget
      const getSimulatedValue = (widgetId) => {
        if (!widgetId) {
          return null;
        }

        // Buscar directamente por ID del widget en la configuración
        if (config[widgetId]) {
          const value = config[widgetId].value;
          return value;
        }

        return null;
      };

      // Función para evaluar una comparación
      const evaluateComparison = (variable, comparison, comparisonValue) => {
        const simulatedValue = getSimulatedValue(variable);
        if (simulatedValue === null || simulatedValue === undefined) {
          return false;
        }

        const targetValue = parseFloat(comparisonValue);
        if (isNaN(targetValue)) {
          return false;
        }

        let result;
        switch (comparison) {
          case ">":
            result = simulatedValue > targetValue;
            break;
          case "<":
            result = simulatedValue < targetValue;
            break;
          case ">=":
            result = simulatedValue >= targetValue;
            break;
          case "<=":
            result = simulatedValue <= targetValue;
            break;
          case "==":
          case "===":
            result = simulatedValue === targetValue;
            break;
          case "!=":
          case "!==":
            result = simulatedValue !== targetValue;
            break;
          default:
            result = false;
        }

        return result;
      };

      // Evaluar entrada superior (top)
      let topResult = true; // Por defecto true

      if (topEdge) {
        const sourceNode = nodes.find((n) => n.id === topEdge.source);

        // Si topInputVariable es "condicion", significa que viene de una condición ya evaluada
        if (
          topInputVariable === "condicion" ||
          topInputVariable === "condition"
        ) {
          topResult = true;
        }
        // Si viene de condition/join node, es TRUE porque ya pasó la evaluación
        else if (
          sourceNode?.type === "condition" ||
          sourceNode?.type === "join"
        ) {
          topResult = true;
        }
        // Si viene de trigger y tiene condición configurada en el JOIN
        else if (
          sourceNode?.type === "trigger" &&
          topComparison &&
          topComparisonValue &&
          topInputVariable
        ) {
          topResult = evaluateComparison(
            topInputVariable,
            topComparison,
            topComparisonValue
          );
        }
        // Cualquier otro caso (trigger sin condición, delay, action)
        else {
          topResult = true;
        }
      }

      // Evaluar entrada inferior (bottom)
      let bottomResult = true; // Por defecto true

      if (bottomEdge) {
        const sourceNode = nodes.find((n) => n.id === bottomEdge.source);

        // Si bottomInputVariable es "condicion", significa que viene de una condición ya evaluada
        if (
          bottomInputVariable === "condicion" ||
          bottomInputVariable === "condition"
        ) {
          bottomResult = true;
        }
        // Si viene de condition/join node, es TRUE porque ya pasó la evaluación
        else if (
          sourceNode?.type === "condition" ||
          sourceNode?.type === "join"
        ) {
          bottomResult = true;
        }
        // Si viene de trigger y tiene condición configurada en el JOIN
        else if (
          sourceNode?.type === "trigger" &&
          bottomComparison &&
          bottomComparisonValue &&
          bottomInputVariable
        ) {
          bottomResult = evaluateComparison(
            bottomInputVariable,
            bottomComparison,
            bottomComparisonValue
          );
        }
        // Cualquier otro caso (trigger sin condición, delay, action)
        else {
          bottomResult = true;
        }
      }

      // Aplicar lógica AND u OR
      const finalResult =
        joinMode === "and"
          ? topResult && bottomResult
          : topResult || bottomResult;

      return finalResult;
    };

    // Find all trigger nodes
    const triggerNodes = nodes.filter((n) => n.type === "trigger");
    if (triggerNodes.length === 0) {
      setIsSimulating(false);
      return;
    }

    // Build execution paths with support for JOIN nodes
    const buildExecutionPaths = (startNodeId, config) => {
      const paths = []; // Array de paths (cada path es un array de {nodeId, direction, fromHandle})

      // Función recursiva para construir paths
      const buildPath = (currentId, currentPath, visitedInPath) => {
        if (visitedInPath.has(currentId)) return; // Evitar ciclos

        const currentNode = nodes.find((n) => n.id === currentId);
        if (!currentNode) return;

        const newVisited = new Set(visitedInPath);
        newVisited.add(currentId);

        const outgoingEdges = edges.filter((e) => e.source === currentId);

        switch (currentNode.type) {
          case "trigger":
          case "delay":
          case "action": {
            // Nodos simples sin ramificación
            const newPath = [
              ...currentPath,
              { nodeId: currentId, direction: null, fromHandle: null },
            ];

            if (outgoingEdges.length === 0) {
              // Nodo terminal
              paths.push(newPath);
            } else {
              // Continuar con las salidas
              outgoingEdges.forEach((edge) => {
                buildPath(edge.target, newPath, newVisited);
              });
            }
            break;
          }

          case "condition": {
            // Evaluar la condición
            const conditionResult = evaluateCondition(currentNode, config);
            const direction = conditionResult ? "true" : "false";
            const targetHandle = direction;

            const newPath = [
              ...currentPath,
              { nodeId: currentId, direction, fromHandle: null },
            ];

            // Seguir solo la rama que corresponde
            const targetEdge = outgoingEdges.find(
              (e) => e.sourceHandle === targetHandle
            );
            if (targetEdge) {
              buildPath(targetEdge.target, newPath, newVisited);
            } else {
              // No hay salida, terminar path
              paths.push(newPath);
            }
            break;
          }

          case "join": {
            // Para JOIN, necesitamos verificar cuántas entradas tiene
            const incomingEdges = edges.filter((e) => e.target === currentId);

            // El JOIN necesita esperar a que lleguen ambas entradas
            // Por ahora, agregamos el nodo con marca de "espera"
            const newPath = [
              ...currentPath,
              {
                nodeId: currentId,
                direction: null,
                fromHandle: null,
                waitForJoin: true,
                incomingCount: incomingEdges.length,
              },
            ];

            // Después de la espera, evaluar y continuar
            const joinResult = evaluateJoin(currentNode, config);
            const direction = joinResult ? "output-true" : "output-false";

            // Agregar el nodo de evaluación después de la espera
            const evaluatedPath = [
              ...newPath,
              {
                nodeId: currentId,
                direction,
                fromHandle: null,
                isJoinEvaluation: true,
              },
            ];

            // Seguir con la salida correspondiente
            const targetEdge = outgoingEdges.find(
              (e) => e.sourceHandle === direction
            );
            if (targetEdge) {
              buildPath(targetEdge.target, evaluatedPath, newVisited);
            } else {
              paths.push(evaluatedPath);
            }
            break;
          }

          default: {
            const newPath = [
              ...currentPath,
              { nodeId: currentId, direction: null, fromHandle: null },
            ];

            if (outgoingEdges.length === 0) {
              paths.push(newPath);
            } else {
              outgoingEdges.forEach((edge) => {
                buildPath(edge.target, newPath, newVisited);
              });
            }
            break;
          }
        }
      };

      buildPath(startNodeId, [], new Set());
      return paths;
    };

    // Execute simulation with support for multiple paths reaching JOIN nodes
    const allPaths = [];
    triggerNodes.forEach((triggerNode) => {
      const paths = buildExecutionPaths(triggerNode.id, config);
      paths.forEach((path) =>
        allPaths.push({ path, triggerId: triggerNode.id })
      );
    });

    if (allPaths.length === 0) {
      setIsSimulating(false);
      return;
    }

    const STEP_DURATION = 1000;

    // Limpiar todos los paths (combinar waitForJoin + isJoinEvaluation)
    const cleanedPaths = allPaths.map(({ path, triggerId }) => {
      const cleanedPath = [];
      let skipNext = false;

      path.forEach((item, index) => {
        if (skipNext) {
          skipNext = false;
          return;
        }

        if (item.waitForJoin) {
          const nextItem = path[index + 1];
          if (nextItem && nextItem.isJoinEvaluation) {
            cleanedPath.push({
              ...item,
              direction: nextItem.direction,
              combinedJoin: true,
            });
            skipNext = true;
          } else {
            cleanedPath.push(item);
          }
        } else if (!item.isJoinEvaluation) {
          cleanedPath.push(item);
        }
      });

      return { path: cleanedPath, triggerId };
    });

    // Encontrar todos los nodos JOIN en todos los paths
    const joinNodeIds = new Set();
    cleanedPaths.forEach(({ path }) => {
      path.forEach((item) => {
        if (item.waitForJoin || item.combinedJoin) {
          joinNodeIds.add(item.nodeId);
        }
      });
    });

    // Usar el primer path como referencia
    const cleanedPath = cleanedPaths[0].path;
    let currentTime = 0;

    cleanedPath.forEach((pathItem, stepIndex) => {
      const { nodeId, direction, waitForJoin, combinedJoin } = pathItem;

      setTimeout(() => {
        if (waitForJoin || combinedJoin) {
          // JOIN node - mostrar espera primero
          setNodes((nds) =>
            nds.map((node) => ({
              ...node,
              data: {
                ...node.data,
                isWaiting: node.id === nodeId ? true : false,
                isExecuting: node.id === nodeId ? true : false,
                executionDirection: null,
              },
            }))
          );

          // Animar TODAS las edges de entrada del JOIN
          const incomingEdges = edges.filter((e) => e.target === nodeId);

          if (incomingEdges.length > 0) {
            // Obtener IDs de los edges de entrada
            const incomingEdgeIds = incomingEdges.map((e) => e.id);

            setEdges((eds) =>
              eds.map((edge) => ({
                ...edge,
                animated: incomingEdgeIds.includes(edge.id),
                style: incomingEdgeIds.includes(edge.id)
                  ? { stroke: "#22c55e", strokeWidth: 3 }
                  : {},
              }))
            );
          }

          // Después de 1 segundo, evaluar el JOIN
          setTimeout(() => {
            setNodes((nds) =>
              nds.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  isWaiting: node.id === nodeId ? false : node.data.isWaiting,
                  isExecuting: node.id === nodeId ? true : false,
                  executionDirection: node.id === nodeId ? direction : null,
                },
              }))
            );

            // Limpiar animación de edge de entrada
            setEdges((eds) =>
              eds.map((edge) => ({
                ...edge,
                animated: false,
                style: {},
              }))
            );
          }, STEP_DURATION);
        } else {
          // Nodo normal
          setNodes((nds) =>
            nds.map((node) => ({
              ...node,
              data: {
                ...node.data,
                isExecuting: node.id === nodeId ? true : false,
                executionDirection: node.id === nodeId ? direction : null,
                isWaiting: false,
              },
            }))
          );

          // Animar el edge que conecta al nodo anterior
          if (stepIndex > 0) {
            const prevNodeId = cleanedPath[stepIndex - 1].nodeId;
            const prevDirection = cleanedPath[stepIndex - 1].direction;
            let targetEdge = null;

            const prevNode = nodes.find((n) => n.id === prevNodeId);

            if (prevNode?.type === "condition" || prevNode?.type === "join") {
              targetEdge = edges.find(
                (e) =>
                  e.source === prevNodeId &&
                  e.target === nodeId &&
                  e.sourceHandle === prevDirection
              );
            } else {
              targetEdge = edges.find(
                (e) => e.source === prevNodeId && e.target === nodeId
              );
            }

            if (targetEdge) {
              setEdges((eds) =>
                eds.map((edge) => ({
                  ...edge,
                  animated: edge.id === targetEdge.id,
                  style:
                    edge.id === targetEdge.id
                      ? { stroke: "#22c55e", strokeWidth: 3 }
                      : {},
                }))
              );
            }
          }
        }

        // Limpiar al final del path
        if (stepIndex === cleanedPath.length - 1) {
          setTimeout(
            () => {
              setNodes((nds) =>
                nds.map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    isExecuting: false,
                    executionDirection: null,
                    isWaiting: false,
                  },
                }))
              );
              setEdges((eds) =>
                eds.map((edge) => ({
                  ...edge,
                  animated: false,
                  style: {},
                }))
              );
              setIsSimulating(false);
            },
            waitForJoin || combinedJoin ? STEP_DURATION * 2 : STEP_DURATION
          );
        }
      }, currentTime);

      // Aumentar tiempo para el siguiente paso
      // JOIN nodes toman el doble de tiempo (espera + evaluación)
      currentTime +=
        waitForJoin || combinedJoin ? STEP_DURATION * 2 : STEP_DURATION;
    });
  };

  const handleExecuteClick = () => {
    setIsSimConfigOpen(true);
  };

  // Función para guardar el workflow
  const openSimulationConfig = () => {
    setIsSimConfigOpen(true);
  };

  // Funciones de validación
  const validateNode = useCallback((node, allEdges) => {
    const errors = [];

    switch (node.type) {
      case "trigger": {
        // Validar que tenga configuración básica
        if (node.data.sensorType === "schedule") {
          if (!node.data.hour || !node.data.minute) {
            errors.push("Falta configurar la hora");
          }
        } else if (node.data.sensorType === "actuatorState") {
          if (!node.data.targetActuator) {
            errors.push("Falta seleccionar el actuador");
          }
        } else {
          if (!node.data.comparison || !node.data.value) {
            errors.push("Falta configurar la condición");
          }
        }
        // Validar que tenga al menos una conexión de salida
        const hasOutput = allEdges.some((edge) => edge.source === node.id);
        if (!hasOutput) {
          errors.push("El trigger debe conectarse a otro nodo");
        }
        break;
      }

      case "condition": {
        // Validar que tenga configuración
        if (node.data.conditionType === "comparison") {
          if (
            !node.data.variable ||
            !node.data.comparison ||
            !node.data.comparisonValue
          ) {
            errors.push("Falta configurar la comparación");
          }
        } else if (node.data.conditionType === "range") {
          if (!node.data.minValue || !node.data.maxValue) {
            errors.push("Falta configurar el rango");
          }
        } else if (node.data.conditionType === "timeRange") {
          if (!node.data.startTime || !node.data.endTime) {
            errors.push("Falta configurar el rango horario");
          }
        }
        // Validar que tenga una entrada
        const hasInput = allEdges.some((edge) => edge.target === node.id);
        if (!hasInput) {
          errors.push("La condición debe recibir una conexión de entrada");
        }
        // Validar que tenga al menos una salida
        const hasCondOutput = allEdges.some((edge) => edge.source === node.id);
        if (!hasCondOutput) {
          errors.push("La condición debe conectarse a otro nodo");
        }
        break;
      }

      case "action": {
        // Validar que tenga actuador seleccionado
        if (!node.data.targetWidget && !node.data.actuator) {
          errors.push("Falta seleccionar el actuador");
        }
        // Validar configuración según el tipo de acción
        if (node.data.actionType === "pwm" && !node.data.pwmValue) {
          errors.push("Falta configurar el valor PWM");
        } else if (
          node.data.actionType === "timer" &&
          !node.data.timerDuration
        ) {
          errors.push("Falta configurar la duración del timer");
        } else if (node.data.actionType === "cycles") {
          if (
            !node.data.cycleOnTime ||
            !node.data.cycleOffTime ||
            !node.data.cycleRepeat
          ) {
            errors.push("Falta configurar los ciclos");
          }
        }
        // Validar que tenga una entrada
        const hasActionInput = allEdges.some((edge) => edge.target === node.id);
        if (!hasActionInput) {
          errors.push("La acción debe recibir una conexión de entrada");
        }
        break;
      }

      case "delay": {
        // Validar que tenga duración
        if (!node.data.delayDuration) {
          errors.push("Falta configurar la duración");
        }
        // Validar entrada y salida
        const hasDelayInput = allEdges.some((edge) => edge.target === node.id);
        const hasDelayOutput = allEdges.some((edge) => edge.source === node.id);
        if (!hasDelayInput) {
          errors.push("El delay debe recibir una conexión de entrada");
        }
        if (!hasDelayOutput) {
          errors.push("El delay debe conectarse a otro nodo");
        }
        break;
      }

      case "join": {
        // Validar que tenga ambas entradas conectadas
        const topInput = allEdges.find(
          (edge) => edge.target === node.id && edge.targetHandle === "input-top"
        );
        const bottomInput = allEdges.find(
          (edge) =>
            edge.target === node.id && edge.targetHandle === "input-bottom"
        );
        if (!topInput) {
          errors.push("Falta conectar la entrada superior");
        }
        if (!bottomInput) {
          errors.push("Falta conectar la entrada inferior");
        }
        // Validar configuración de comparación
        if (!node.data.topComparison || !node.data.topComparisonValue) {
          errors.push("Falta configurar la comparación superior");
        }
        if (!node.data.bottomComparison || !node.data.bottomComparisonValue) {
          errors.push("Falta configurar la comparación inferior");
        }
        // Validar que tenga al menos una salida
        const hasJoinOutput = allEdges.some((edge) => edge.source === node.id);
        if (!hasJoinOutput) {
          errors.push("El join debe conectarse a otro nodo");
        }
        break;
      }

      default:
        break;
    }

    return errors;
  }, []);

  const validateWorkflow = useCallback(() => {
    const errors = {};
    let hasErrors = false;

    // Validar que haya al menos un trigger
    const hasTrigger = nodes.some((node) => node.type === "trigger");
    if (!hasTrigger) {
      toast({
        description: "El workflow debe tener al menos un nodo trigger",
      });
      return false;
    }

    // Validar cada nodo y actualizar su estado visual
    const updatedNodes = nodes.map((node) => {
      const nodeErrors = validateNode(node, edges);
      if (nodeErrors.length > 0) {
        errors[node.id] = nodeErrors;
        hasErrors = true;
        // Marcar nodo con error
        return {
          ...node,
          data: {
            ...node.data,
            validationState: "error",
          },
          className: showValidation ? "validation-error" : "",
        };
      } else {
        // Marcar nodo como válido
        return {
          ...node,
          data: {
            ...node.data,
            validationState: "valid",
          },
          className: showValidation ? "validation-success" : "",
        };
      }
    });

    // Actualizar los nodos con el estado de validación
    if (showValidation) {
      setNodes(updatedNodes);
    }

    setValidationErrors(errors);

    // Mostrar mensaje de error con detalles
    if (hasErrors) {
      const errorCount = Object.keys(errors).length;
      toast({
        variant: "destructive",
        description: `⚠️ ${errorCount} nodo${
          errorCount > 1 ? "s" : ""
        } con errores de validación`,
      });
    }

    return !hasErrors;
  }, [nodes, edges, validateNode, showValidation, setNodes, toast]);

  // Función para guardar el workflow
  const handleSaveWorkflow = async () => {
    try {
      setIsSaving(true);

      // Validar el workflow antes de guardar
      setShowValidation(true);
      const isValid = validateWorkflow();

      if (!isValid) {
        setIsSaving(false);
        // Mostrar nodos con error en rojo por 3 segundos
        setTimeout(() => {
          setShowValidation(false);
        }, 3000);
        return;
      }

      // Mostrar efecto de validación exitosa (verde) por 1 segundo
      setTimeout(() => {
        setShowValidation(false);
      }, 1000);

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
      console.log(response);
      if (response.success) {
        const newWorkflowId = response.data.id;

        if (!workflowId) {
          // Nuevo workflow creado
          setWorkflowId(newWorkflowId);

          // Actualizar la URL con el ID del workflow
          navigate(`?id=${newWorkflowId}`, { replace: true });

          // Mostrar notificación de éxito
          toast({
            description: `Workflow "${workflowName}" creado y guardado`,
          });
        } else {
          // Workflow actualizado
          toast({
            description: `Workflow "${workflowName}" actualizado`,
          });
        }
      }
    } catch (error) {
      console.error("Error guardando workflow:", error);
      toast({
        variant: "destructive",
        description: "Error guardando el workflow",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-background">
      {/* Main Flow Canvas */}
      <div className="flex-1 relative" data-tour="editor-canvas">
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
              if (node.type === "delay") return "rgb(245 158 11)"; // amber-500
              if (node.type === "join") return "rgb(245 158 11)"; // amber-500 (utility)
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
              data-tour="save-workflow-btn"
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
              data-tour="simulate-workflow-btn"
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
                  data-tour="workflow-name"
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
      <NodePaletteSidebar
        onAddNode={addNode}
        selectedDevice={selectedDevice}
        isProUser={isProUser}
        userId={userId}
      />

      {/* NodeEditModal component */}
      <NodeEditModal
        node={selectedNode}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNode}
        nodes={nodes}
        edges={edges}
      />

      <SimulationConfigModal
        open={isSimConfigOpen}
        onClose={() => setIsSimConfigOpen(false)}
        onStart={executeSimulation}
        currentConfig={simulationConfig}
        selectedDevice={selectedDevice}
      />
    </div>
  );
}

// Componente principal que envuelve con SidebarProvider y ReactFlowProvider
export default function NodeWorkspace({ userId }) {
  return (
    <ReactFlowProvider>
      <SidebarProvider defaultOpen={true}>
        <NodeWorkspaceContent userId={userId} />
      </SidebarProvider>
    </ReactFlowProvider>
  );
}
