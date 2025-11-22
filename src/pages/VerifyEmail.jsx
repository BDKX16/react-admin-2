import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { verifyEmail as verifyEmailService } from "../services/public";
import useAuth from "../hooks/useAuth";
import { createUserAdapter } from "../adapters/user";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { setUserData } = useAuth();
  const { callEndpoint } = useFetchAndLoad();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    // Evitar múltiples ejecuciones
    if (hasVerified) return;

    const verifyEmail = async () => {
      const token = searchParams.get("peticion");

      if (!token) {
        setStatus("error");
        setErrorMessage("Token de verificación no encontrado");
        return;
      }

      setHasVerified(true);

      try {
        const response = await callEndpoint(verifyEmailService(token));

        if (response.error === true) {
          setStatus("error");
          setErrorMessage(
            "Error al verificar el correo. Por favor intenta nuevamente."
          );
          return;
        }

        if (response.data && response.data.status === "success") {
          console.log("✅ Email verificado exitosamente:", response);

          // Usar setUserData para autenticar (igual que el login)
          setUserData(createUserAdapter(response.data));

          setStatus("success");

          // Verificar si necesita onboarding y redirigir
          if (response.data.needsOnboarding) {
            console.log("🔄 Usuario necesita onboarding, redirigiendo...");
            setTimeout(() => {
              window.location.href = "/onboarding";
            }, 1500);
          } else {
            setTimeout(() => {
              window.location.href = "/dashboard";
            }, 1500);
          }
        } else {
          setStatus("error");
          setErrorMessage(response.data?.error || "Error desconocido");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("error");
        setErrorMessage(
          "Error al verificar el correo. Por favor intenta nuevamente."
        );
      }
    };

    verifyEmail();
  }, [searchParams, callEndpoint, setUserData, hasVerified]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          {status === "verifying" && (
            <>
              <div className="mx-auto mb-4 flex items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl">Verificando tu correo</CardTitle>
              <CardDescription>
                Por favor espera mientras confirmamos tu cuenta...
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                ¡Correo verificado!
              </CardTitle>
              <CardDescription>
                Tu cuenta ha sido confirmada exitosamente. Redirigiendo...
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex items-center justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                Error de verificación
              </CardTitle>
              <CardDescription className="text-red-500 dark:text-red-400 mt-2">
                {errorMessage}
              </CardDescription>
            </>
          )}
        </CardHeader>

        {status === "error" && (
          <CardContent className="space-y-4">
            <Button
              onClick={() => (window.location.href = "/login")}
              className="w-full"
              variant="default"
            >
              Ir al inicio de sesión
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
