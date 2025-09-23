import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Mail, User, Edit3, X } from "lucide-react";
import { updateUserProfile, cancelEmailChange } from "@/services/private";
import useAuth from "@/hooks/useAuth";
import { enqueueSnackbar } from "notistack";

export function UserProfileSettings() {
  const { auth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: auth?.userData?.name || "",
    email: auth?.userData?.email || "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);

    try {
      const changes = {};

      // Solo enviar campos que han cambiado
      if (formData.name !== auth?.userData?.name) {
        changes.name = formData.name;
      }

      if (formData.email !== auth?.userData?.email) {
        changes.email = formData.email;
      }

      if (Object.keys(changes).length === 0) {
        enqueueSnackbar("No hay cambios para guardar", { variant: "info" });
        setIsEditing(false);
        return;
      }

      const response = await updateUserProfile(changes);

      if (response.call) {
        const result = await response.call;

        if (result.error) {
          enqueueSnackbar("Error al actualizar el perfil", {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Perfil actualizado exitosamente", {
            variant: "success",
          });

          if (changes.email) {
            enqueueSnackbar(
              "Se ha enviado un email de confirmación a tu nueva dirección",
              { variant: "info", autoHideDuration: 6000 }
            );
          }

          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      enqueueSnackbar("Error al actualizar el perfil", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: auth?.userData?.name || "",
      email: auth?.userData?.email || "",
    });
    setIsEditing(false);
  };

  const handleCancelEmailChange = async () => {
    setIsLoading(true);

    try {
      const response = await cancelEmailChange();

      if (response.call) {
        const result = await response.call;

        if (result.error) {
          enqueueSnackbar("Error al cancelar el cambio de email", {
            variant: "error",
          });
        } else {
          enqueueSnackbar("Cambio de email cancelado", { variant: "success" });
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

  // Simulamos que hay un cambio de email pendiente
  const hasPendingEmailChange = false; // Esto vendría del estado del usuario

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información Personal
        </CardTitle>
        <CardDescription className="text-left">
          Administra tu información personal y configuración de cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información del Usuario */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-left">Datos Personales</h3>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                placeholder="Ingresa tu nombre completo"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Dirección de email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                placeholder="tu@email.com"
              />
              {isEditing && formData.email !== auth?.userData?.email && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Se enviará un email de confirmación a la nueva dirección
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </div>

        {/* Cambio de Email Pendiente */}
        {hasPendingEmailChange && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-left">
                Cambio de Email Pendiente
              </h3>
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-orange-800 dark:text-orange-200">
                        Confirmación pendiente
                      </span>
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-300"
                      >
                        Pendiente
                      </Badge>
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Hemos enviado un email de confirmación a tu nueva
                      dirección. Revisa tu bandeja de entrada y haz clic en el
                      enlace para confirmar el cambio.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEmailChange}
                      disabled={isLoading}
                      className="mt-2"
                    >
                      Cancelar cambio de email
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Estado de Verificación */}
        <Separator />
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-left">Estado de la Cuenta</h3>
          <div className="flex items-center justify-between gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex flex-col justify-start align-start gap-1">
              <p className="font-medium justify-start text-green-800 dark:text-green-200 text-left">
                Email verificado
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 text-left">
                Tu dirección de email ha sido verificada exitosamente
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
