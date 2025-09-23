import { useNavigate } from "react-router-dom";
import {
  XCircle,
  ArrowLeft,
  RotateCcw,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PaymentError = () => {
  const navigate = useNavigate();

  // Posibles errores (en una app real vendría del estado o parámetros)
  const errorReasons = [
    {
      code: "INSUFFICIENT_FUNDS",
      title: "Fondos insuficientes",
      description:
        "Tu tarjeta no tiene suficiente saldo para completar la transacción.",
      solution: "Verifica el saldo de tu tarjeta o usa otro método de pago.",
    },
    {
      code: "DECLINED_CARD",
      title: "Tarjeta rechazada",
      description: "Tu banco ha rechazado la transacción.",
      solution:
        "Contacta a tu banco para autorizar pagos en línea o usa otra tarjeta.",
    },
    {
      code: "EXPIRED_CARD",
      title: "Tarjeta vencida",
      description: "La tarjeta que intentaste usar está vencida.",
      solution: "Usa una tarjeta vigente o actualiza los datos de tu tarjeta.",
    },
    {
      code: "NETWORK_ERROR",
      title: "Error de conexión",
      description: "Hubo un problema de conectividad durante el proceso.",
      solution: "Verifica tu conexión a internet e intenta nuevamente.",
    },
  ];

  // Simular un error aleatorio
  const currentError =
    errorReasons[Math.floor(Math.random() * errorReasons.length)];

  const handleRetry = () => {
    // Volver al checkout con los mismos parámetros
    navigate("/subscription");
  };

  const handleSupport = () => {
    // En una app real, abriría un chat o formulario de soporte
    window.open(
      "mailto:soporte@confiiot.com?subject=Error en el pago",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Error Icon */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Pago No Procesado
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No pudimos procesar tu pago
          </p>
        </div>

        {/* Error Details */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="w-5 h-5" />
              {currentError.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Estado:</span>
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Fallido
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Código de error:
              </span>
              <span className="font-mono text-sm">{currentError.code}</span>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Descripción del problema:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentError.description}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Cómo solucionarlo:</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentError.solution}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problemas Comunes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2" />
                <div className="text-sm">
                  <div className="font-medium">
                    Datos de tarjeta incorrectos
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Verifica el número, fecha de vencimiento y código de
                    seguridad
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2" />
                <div className="text-sm">
                  <div className="font-medium">Límites de gasto</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Tu banco puede tener límites para compras en línea
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2" />
                <div className="text-sm">
                  <div className="font-medium">
                    Restricciones internacionales
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Algunas tarjetas no permiten compras internacionales
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Payment Methods */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                ¿Problemas con MercadoPago?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Puedes intentar con transferencia bancaria para completar tu
                suscripción.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/checkout?plan=plus&currency=ARS")}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Usar Transferencia
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleRetry} className="w-full" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Intentar Nuevamente
          </Button>

          <Button variant="outline" onClick={handleSupport} className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contactar Soporte
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/subscription")}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Planes
          </Button>

          <div className="text-center text-xs text-gray-500">
            Tiempo de respuesta promedio del soporte: <strong>2 horas</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;
