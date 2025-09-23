import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PaymentPending = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simular verificación del pago cada 5 segundos
    const interval = setInterval(() => {
      // En una implementación real, aquí harías una llamada a tu API
      // para verificar el estado del pago
      const shouldComplete = Math.random() > 0.7; // 30% de probabilidad

      if (shouldComplete) {
        clearInterval(interval);
        navigate("/payment/success");
      }
    }, 5000);

    // Timeout después de 5 minutos
    const timeout = setTimeout(() => {
      clearInterval(interval);
      navigate("/payment/error");
    }, 300000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Procesando tu Pago
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Estamos verificando tu transacción con MercadoPago
          </p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200"
              >
                <Clock className="w-3 h-3 mr-1" />
                Pendiente
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Estado:</span>
              <span className="font-medium">Verificando pago...</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Tiempo estimado:
              </span>
              <span className="font-medium">1-3 minutos</span>
            </div>

            {/* Progress Steps */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Pago iniciado</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Verificando con MercadoPago...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                <span className="text-sm text-gray-400">
                  Activando suscripción
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-blue-800 dark:text-blue-200">
                    No cierres esta ventana
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 mt-1">
                    Te redirigiremos automáticamente una vez confirmado el pago.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => navigate("/subscription")}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Planes
          </Button>

          <div className="text-center text-xs text-gray-500">
            ¿Problemas con el pago?{" "}
            <button
              onClick={() => navigate("/payment/error")}
              className="text-blue-600 hover:underline"
            >
              Contactar soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
