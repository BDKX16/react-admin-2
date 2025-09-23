import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Mail, X } from "lucide-react";
import { confirmEmailChange } from "@/services/public";
import { cancelEmailChange } from "@/services/private";
import useAuth from "@/hooks/useAuth";
import { enqueueSnackbar } from "notistack";

export default function ConfirmEmailChange() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("pending"); // pending, confirming, confirmed, cancelled, error

  const token = searchParams.get("token");
  const newEmail = searchParams.get("email");

  useEffect(() => {
    // Si no hay token o email en la URL, redirigir
    if (!token || !newEmail) {
      navigate("/dashboard");
    }
  }, [token, newEmail, navigate]);

  const handleConfirmEmail = async () => {
    if (!token || !newEmail) return;

    setIsLoading(true);
    setStatus("confirming");

    try {
      const response = await confirmEmailChange(token, newEmail);

      if (response.call) {
        const result = await response.call;

        if (result.error) {
          setStatus("error");
          enqueueSnackbar("Error al confirmar el cambio de email", {
            variant: "error",
          });
        } else {
          setStatus("confirmed");
          enqueueSnackbar("Email confirmado exitosamente", {
            variant: "success",
          });

          // Redirigir al dashboard después de 3 segundos
          setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error confirming email:", error);
      setStatus("error");
      enqueueSnackbar("Error al confirmar el cambio de email", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEmailChange = async () => {
    setIsLoading(true);
    setStatus("cancelling");

    try {
      const response = await cancelEmailChange();

      if (response.call) {
        const result = await response.call;

        if (result.error) {
          enqueueSnackbar("Error al cancelar el cambio de email", {
            variant: "error",
          });
        } else {
          setStatus("cancelled");
          enqueueSnackbar("Cambio de email cancelado", { variant: "info" });

          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error cancelling email change:", error);
      enqueueSnackbar("Error al cancelar el cambio de email", {
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "confirming":
        return (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">
              Confirmando cambio de email...
            </p>
          </div>
        );

      case "confirmed":
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-700">
                ¡Email Confirmado!
              </h3>
              <p className="text-muted-foreground">
                Tu email ha sido cambiado exitosamente a:{" "}
                <strong>{newEmail}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Serás redirigido al dashboard en unos segundos...
              </p>
            </div>
          </div>
        );

      case "cancelled":
        return (
          <div className="text-center space-y-4">
            <X className="h-16 w-16 text-orange-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-orange-700">
                Cambio Cancelado
              </h3>
              <p className="text-muted-foreground">
                El cambio de email ha sido cancelado exitosamente.
              </p>
              <p className="text-sm text-muted-foreground">
                Serás redirigido al dashboard en unos segundos...
              </p>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-700">Error</h3>
              <p className="text-muted-foreground">
                Ha ocurrido un error al procesar tu solicitud. El enlace puede
                haber expirado o ser inválido.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="mt-4"
              >
                Volver al Dashboard
              </Button>
            </div>
          </div>
        );

      default: // pending
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Mail className="h-16 w-16 text-blue-500 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  Confirmar Cambio de Email
                </h3>
                <p className="text-muted-foreground">
                  Estás a punto de cambiar tu email a:
                </p>
                <p className="text-lg font-medium text-primary">{newEmail}</p>
                {user?.email && (
                  <p className="text-sm text-muted-foreground">
                    Email actual: {user.email}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleConfirmEmail}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Confirmando..." : "Confirmar Cambio de Email"}
              </Button>

              <Button
                onClick={handleCancelEmailChange}
                disabled={isLoading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isLoading ? "Cancelando..." : "Cancelar Cambio"}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="text-sm text-muted-foreground"
              >
                Volver al Dashboard
              </Button>
            </div>
          </div>
        );
    }
  };

  if (!token || !newEmail) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <div className="flex h-screen-dvh w-full items-center justify-center px-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Confirmación de Email</CardTitle>
          <CardDescription>
            Confirma o cancela el cambio de tu dirección de email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
