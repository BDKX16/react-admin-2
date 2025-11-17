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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import axios from "axios";
import { CheckCircle2, Loader2, AlertTriangle, KeyRound } from "lucide-react";

export default function ClaimDevice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user);

  const serial = searchParams.get("serial")?.trim() || "";

  const [deviceName, setDeviceName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Si no hay token, guardar la ruta actual y redirigir al login
    if (!userState?.token && serial) {
      const redirectPath = `/claim?serial=${serial}`;
      console.log("🔄 No hay token, guardando redirect:", redirectPath);
      sessionStorage.setItem("redirectAfterLogin", redirectPath);
      navigate("/login", { replace: true });
    }
  }, [userState?.token, navigate, serial]);

  useEffect(() => {
    setError(null);
  }, [serial]);

  const handleClaim = async (e) => {
    e.preventDefault();
    setError(null);

    if (!serial) {
      setError(
        "Falta el serial del dispositivo en la URL (?serial=...). Escanea el QR nuevamente."
      );
      return;
    }

    if (!deviceName || deviceName.trim().length < 3) {
      setError("Ingresa un nombre válido (mínimo 3 caracteres).");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/device`,
        {
          newDevice: {
            dId: serial,
            name: deviceName.trim(),
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: userState.token,
          },
        }
      );

      if (response.data.status === "success") {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError(response.data.error || "No se pudo reclamar el dispositivo.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        (err.response?.status === 404
          ? "El serial no es correcto o ya fue reclamado."
          : "Error al conectar con el servidor. Inténtalo de nuevo.");
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Si no hay token, el useEffect ya redirigió
  if (!userState?.token) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">
            Reclamar dispositivo
          </CardTitle>
          <CardDescription className="text-center">
            Vincula tu equipo Confi a tu cuenta con el serial del QR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleClaim} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serial">Serial del dispositivo</Label>
              <Input
                id="serial"
                value={serial}
                readOnly
                className="bg-muted"
                placeholder="Escanea el QR para obtener el serial"
              />
              {!serial && (
                <p className="text-xs text-muted-foreground">
                  Falta el parámetro <code>?serial=</code> en la URL. Escanea el
                  código QR del dispositivo.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceName">Nombre del dispositivo</Label>
              <Input
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Ej: Invernadero Principal, Sala de Cultivo 1"
                maxLength={50}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span className="text-green-700 dark:text-green-400">
                  ¡Dispositivo reclamado exitosamente! Redirigiendo...
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !serial || success}
              className="w-full"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reclamando dispositivo...
                </>
              ) : (
                "Reclamar dispositivo"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="w-full"
            >
              Cancelar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
