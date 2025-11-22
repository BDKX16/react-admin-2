import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2, Sparkles, Home } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [deviceSerial, setDeviceSerial] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleWelcomeNext = () => {
    setCurrentStep(1);
  };

  const handleDeviceSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Llamar al endpoint para registrar el dispositivo
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/device`,
        {
          newDevice: {
            dId: deviceSerial.trim(),
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

        // Redirigir al dashboard
        navigate("/");
      } else {
        setError(response.data.error || "Error al registrar el dispositivo");
      }
    } catch (err) {
      console.error("Error registering device:", err);
      setError(
        err.response?.data?.error ||
          "Error al registrar el dispositivo. Verifica el serial e intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipDevice = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Marcar onboarding como completado sin dispositivo
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

      // Redirigir al dashboard
      navigate("/");
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError("Error al completar el onboarding");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-2xl shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="p-8 md:p-12 text-center space-y-6">
              <div className="mx-auto w-32 h-32 mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-full animate-pulse opacity-20"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles className="h-16 w-16 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  ¡Bienvenido a Confi Plant! 🌱
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Estamos emocionados de tenerte aquí. Configuremos tu cuenta en
                  solo unos pasos.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-8 text-left">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="text-2xl mb-2">🌿</div>
                  <h3 className="font-semibold text-sm mb-1">Control total</h3>
                  <p className="text-xs text-muted-foreground">
                    Monitorea y controla tus dispositivos desde cualquier lugar
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold text-sm mb-1">Analíticas</h3>
                  <p className="text-xs text-muted-foreground">
                    Visualiza datos en tiempo real con gráficos interactivos
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-semibold text-sm mb-1">Automatización</h3>
                  <p className="text-xs text-muted-foreground">
                    Crea reglas y flujos de trabajo personalizados
                  </p>
                </div>
              </div>

              <Button
                onClick={handleWelcomeNext}
                size="lg"
                className="mt-8 px-8"
              >
                Comenzar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 1: Device Registration */}
          {currentStep === 1 && (
            <div className="p-8 md:p-12 space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-20 h-20 mb-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Home className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Registra tu dispositivo</h2>
                <p className="text-muted-foreground">
                  Ingresa el número de serie que encontrarás en tu dispositivo
                  Confi Plant
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleDeviceSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deviceSerial" className="text-base">
                    Número de serie del dispositivo
                  </Label>
                  <Input
                    id="deviceSerial"
                    type="text"
                    placeholder="Ej: ABC123XYZ456"
                    value={deviceSerial}
                    onChange={(e) => setDeviceSerial(e.target.value)}
                    className="text-lg h-12"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground">
                    El número de serie se encuentra en la parte posterior de tu
                    dispositivo
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || !deviceSerial.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        Registrar dispositivo
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSkipDevice}
                    disabled={isLoading}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Saltar por ahora
                  </Button>
                </div>
              </form>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  💡 <strong>¿No tienes un dispositivo todavía?</strong> No te
                  preocupes, puedes agregarlo más tarde desde el panel de
                  configuración.
                </p>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          <div className="px-8 pb-6">
            <div className="flex justify-center gap-2">
              {[0, 1].map((step) => (
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
