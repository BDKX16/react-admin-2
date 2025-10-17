import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import NodeWorkspace from "@/components/NodeWorkspace";
import { createCompositeRule, updateCompositeRule } from "../services/public";

import { getWorkflow } from "../services/workflow";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import useDevices from "../hooks/useDevices";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AutomationEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { selectedDevice } = useDevices();

  // Obtener parámetros de la URL
  const isCreating = searchParams.get("create") === "true";
  const ruleId = searchParams.get("id");

  const [automationData, setAutomationData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    // Si ya se ha cargado, no hacer nada
    if (loadedRef.current) return;

    const loadRuleData = async (id) => {
      try {
        const response = await getWorkflow(id);
        if (response.success && response.data) {
          setAutomationData(response.data);
          loadedRef.current = true;
        }
      } catch (error) {
        console.error("Error loading rule data:", error);
      }
    };

    // Si estamos editando, cargar los datos de la regla
    if (!isCreating && ruleId) {
      loadRuleData(ruleId);
    } else if (isCreating && selectedDevice) {
      // Inicializar nueva automatización
      setAutomationData({
        name: "Nueva Automatización Compuesta",
        description: "Descripción de la automatización",
        nodes: [],
        edges: [],
        deviceId: selectedDevice.dId,
      });
      loadedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreating, ruleId, selectedDevice?.dId]);

  const handleSave = async (workspaceData) => {
    if (!selectedDevice) return;

    const automationPayload = {
      ...automationData,
      ...workspaceData,
      deviceId: selectedDevice.dId,
      type: "composite",
    };

    try {
      let response;
      if (isCreating) {
        response = await callEndpoint(createCompositeRule(automationPayload));
      } else {
        response = await callEndpoint(
          updateCompositeRule(ruleId, automationPayload)
        );
      }

      if (!response.error) {
        setHasChanges(false);
        // Redirigir de vuelta al rule engine
        navigate("/rule-engine");
      }
    } catch (error) {
      console.error("Error saving automation:", error);
    }
  };

  const handleWorkspaceChange = (data) => {
    setAutomationData((prev) => ({ ...prev, ...data }));
    setHasChanges(true);
  };

  const handleBack = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm(
        "¿Estás seguro de que quieres salir? Los cambios no guardados se perderán."
      );
      if (!confirmLeave) return;
    }
    navigate("/rule-engine");
  };

  if (!selectedDevice) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Dispositivo no seleccionado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Por favor selecciona un dispositivo para crear automatizaciones.
            </p>
            <Button onClick={handleBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Editor */}
      <div
        className="w-full -mx-4 -mb-4 -pl-4 border-t"
        style={{ height: "20dvh" }}
      >
        {automationData && (
          <NodeWorkspace
            selectedDevice={selectedDevice}
            initialData={automationData}
            onSave={handleSave}
            onChange={handleWorkspaceChange}
          />
        )}
      </div>
    </div>
  );
};

export default AutomationEditor;
