import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
  Leaf,
  BarChart3,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CropTypeSelector from "../components/onboarding/CropTypeSelector";
import DeviceSetupDashboard from "../components/onboarding/DeviceSetupDashboard";
import OTAUpdateStep from "../components/onboarding/OTAUpdateStep";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { getDeviceOTAStatus } from "../services/private";

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { callEndpoint } = useFetchAndLoad();
  const [currentStep, setCurrentStep] = useState(0);
  const [deviceSerial, setDeviceSerial] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceData, setDeviceData] = useState(null);
  const [cropType, setCropType] = useState("");
  const [actuatorConfig, setActuatorConfig] = useState({});
  const [otaStatus, setOtaStatus] = useState(null);
  const [infoMessage, setInfoMessage] = useState("");

  // Paso 1: Bienvenida + Input Serial
  const handleDeviceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const serialTrimmed = deviceSerial.trim();

      // POST request para registrar el dispositivo
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/device`,
        {
          newDevice: {
            dId: serialTrimmed,
            name: "Mi Dispositivo",
          },
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        setDeviceData(response.data);

        // Mostrar mensaje si el dispositivo ya estaba reclamado
        if (response.data.alreadyClaimed) {
          setInfoMessage("Este dispositivo ya está vinculado a tu cuenta. Continuaremos con su configuración.");
        }

        // Verificar estado OTA del dispositivo recién registrado
        try {
          const otaResponse = await callEndpoint(
            getDeviceOTAStatus(response.data.device.dId)
          );

          if (!otaResponse.error && otaResponse.data.data) {
            setOtaStatus(otaResponse.data.data);
            console.log(
              "OTA Status after registration:",
              otaResponse.data.data
            );
          }
        } catch (otaErr) {
          console.error("Error fetching OTA status:", otaErr);
          // No bloqueamos el flujo si falla la verificación OTA
        }

        // Si es confiplant, ir al selector de cultivo (paso 1)
        // Si es tecmat, ir directo al dashboard de setup (paso 2)
        if (response.data.template.model !== "tecmat") {
          setCurrentStep(1);
        } else {
          setCurrentStep(2);
        }
      } else {
        setError(response.data.error || "Error al registrar el dispositivo");
      }
    } catch (err) {
      console.error("Error registering device:", err);
      
      // Mostrar el error del backend
      setError(
        err.response?.data?.error ||
          "Error al registrar el dispositivo. Verifica el serial e intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 2: Selección de tipo de cultivo (solo confiplant)
  const handleCropTypeNext = async () => {
    if (!cropType) {
      setError("Por favor selecciona un tipo de cultivo");
      return;
    }

    setIsLoading(true);
    setError("");
    setInfoMessage("");
    try {
      const token = localStorage.getItem("token");

      // Guardar tipo de cultivo en el dispositivo
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/device/crop-type`,
        {
          dId: deviceData.device.dId,
          cropType: cropType,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      setCurrentStep(2);
    } catch (err) {
      console.error("Error saving crop type:", err);
      setError("Error al guardar el tipo de cultivo");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 3: Completar setup y pasar a OTA
  const handleDeviceSetupComplete = async () => {
    setIsLoading(true);
    setError("");
    setInfoMessage("");
    try {
      const token = localStorage.getItem("token");

      // Guardar configuración de actuadores usando el endpoint device-config
      const configs = Object.entries(actuatorConfig).map(
        ([variable, config]) => ({
          variable,
          variableFullName: "",
          initial: config.startup || 0,
        })
      );

      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/device-config`,
        {
          dId: deviceData.device.dId,
          configs,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Obtener estado OTA del dispositivo
      const otaResponse = await callEndpoint(
        getDeviceOTAStatus(deviceData.device.dId)
      );

      if (!otaResponse.error && otaResponse.data) {
        setOtaStatus(otaResponse.data.data);
      }
      setCurrentStep(3); // Ir al paso de OTA
    } catch (err) {
      console.error("Error in device setup:", err);
      setError("Error al guardar configuración");
    } finally {
      setIsLoading(false);
    }
  };

  // Paso 4: Completar onboarding (desde OTA)
  const handleCompleteOnboarding = async () => {
    try {
      const token = localStorage.getItem("token");

      // Marcar onboarding como completado
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/complete-initial-onboarding`,
        {},
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      // Actualizar userData en localStorage
      const storedUserData = JSON.parse(
        localStorage.getItem("userData") || "{}"
      );
      storedUserData.needsOnboarding = false;
      localStorage.setItem("userData", JSON.stringify(storedUserData));

      // Marcar que el usuario acaba de completar el onboarding (para mostrar el modal de bienvenida)
      sessionStorage.setItem("just_completed_onboarding", "true");

      // Redirigir al dashboard
      navigate("/");
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError("Error al completar el onboarding");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-6xl shadow-2xl overflow-hidden border-0">
        <CardContent className="p-0">
          {/* Paso 0: Bienvenida + Input Serial */}
          {currentStep === 0 && (
            <div className="p-8 md:p-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-4">
                <div className="mx-auto w-32 h-32 mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full animate-pulse opacity-20"></div>
                  <div className="absolute inset-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-white" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    ¡Bienvenido a tu nuevo sistema! 🌱
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    ¡Felicidades por dar este gran paso! Estamos emocionados de
                    acompañarte en esta nueva etapa. Configurar tu dispositivo
                    es muy sencillo, ¡comencemos!
                  </p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {infoMessage && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    {infoMessage}
                  </AlertDescription>
                </Alert>
              )}

              <form
                onSubmit={handleDeviceSubmit}
                className="space-y-6 max-w-md mx-auto"
              >
                <div className="space-y-2">
                  <Label htmlFor="deviceSerial" className="text-base">
                    Número de serie del dispositivo
                  </Label>
                  <Input
                    id="deviceSerial"
                    type="text"
                    placeholder="Ej: ABC123XYZ456"
                    value={deviceSerial}
                    onChange={(e) => {
                      setDeviceSerial(e.target.value);
                      setError("");
                      setInfoMessage("");
                    }}
                    className="text-lg h-12"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Encuéntralo en la parte posterior de tu dispositivo
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg"
                  disabled={isLoading || !deviceSerial.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 grid md:grid-cols-3 gap-4 text-left">
                <div className="relative p-4 pt-14 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <Leaf className="absolute -top-4 -right-4 h-24 w-24 text-green-200 dark:text-green-800 opacity-30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[10deg]" />
                  <h3 className="font-semibold text-sm mb-1 relative z-10">
                    Control total
                  </h3>
                  <p className="text-xs text-muted-foreground relative z-10">
                    Monitorea y controla desde cualquier lugar
                  </p>
                </div>
                <div className="relative p-4 pt-14 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <BarChart3 className="absolute -top-4 -right-4 h-24 w-24 text-blue-200 dark:text-blue-800 opacity-30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[10deg]" />
                  <h3 className="font-semibold text-sm mb-1 relative z-10">
                    Gráficos
                  </h3>
                  <p className="text-xs text-muted-foreground relative z-10">
                    Analiza graficos con maxima presicion
                  </p>
                </div>
                <div className="relative p-4 pt-14 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <Zap className="absolute -top-4 -right-4 h-24 w-24 text-purple-200 dark:text-purple-800 opacity-30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[10deg]" />
                  <h3 className="font-semibold text-sm mb-1 relative z-10">
                    Automatización
                  </h3>
                  <p className="text-xs text-muted-foreground relative z-10">
                    Crea reglas personalizadas
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Paso 1: Selector de tipo de cultivo (solo confiplant) */}
          {currentStep === 1 && deviceData && (
            <div className="p-8 md:p-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold">
                  Selecciona tu tipo de cultivo
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Esto nos ayudará a personalizar tu experiencia y las
                  recomendaciones para tu sistema
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <CropTypeSelector value={cropType} onChange={setCropType} />

              <div className="flex justify-end mt-8">
                <Button
                  size="lg"
                  onClick={handleCropTypeNext}
                  disabled={isLoading || !cropType}
                  className="px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2/3: Dashboard de configuración */}
          {currentStep === 2 && deviceData && (
            <div className="p-8 md:p-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2 mb-8">
                <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold">¡Ya casi estamos!</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Ahora vamos a configurarlo y verificar que todo funcione
                  correctamente
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DeviceSetupDashboard
                device={deviceData.device}
                template={deviceData.template}
                onComplete={handleDeviceSetupComplete}
                onActuatorConfigChange={setActuatorConfig}
              />
            </div>
          )}

          {/* Paso 3/4: Actualización OTA */}
          {currentStep === 3 && deviceData && otaStatus && (
            <div className="p-8 md:p-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <OTAUpdateStep
                device={deviceData.device}
                otaStatus={otaStatus}
                onSkip={handleCompleteOnboarding}
                onComplete={handleCompleteOnboarding}
              />
            </div>
          )}

          {/* Progress indicator */}
          <div className="px-8 pb-6">
            <div className="flex justify-center gap-2">
              {deviceData?.template.type === "confiplant"
                ? [0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-all ${
                        step === currentStep
                          ? "w-8 bg-primary"
                          : step < currentStep
                          ? "w-2 bg-primary"
                          : "w-2 bg-gray-300 dark:bg-gray-700"
                      }`}
                    />
                  ))
                : [0, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-2 rounded-full transition-all ${
                        step === currentStep
                          ? "w-8 bg-primary"
                          : step < currentStep
                          ? "w-2 bg-primary"
                          : "w-2 bg-gray-300 dark:bg-gray-700"
                      }`}
                    />
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
