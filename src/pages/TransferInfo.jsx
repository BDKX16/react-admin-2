import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Building2,
  Clock,
  AlertCircle,
  Upload,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TransferInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [notes, setNotes] = useState("");

  const {
    plan = "Plus",
    price = 2600,
    currency = "ARS",
  } = location.state || {};

  // Datos bancarios (en una app real vendrían del backend)
  const bankDetails = {
    bankName: "Banco Galicia",
    accountType: "Cuenta Corriente",
    accountNumber: "4025-0123-4567-8901-2",
    cbu: "0070042520000012345678",
    alias: "CONFI.IOT.PAGOS",
    holder: "ConfiIoT SRL",
    cuit: "30-12345678-9",
  };

  const referenceId =
    "CONFI-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [field]: true });
    setTimeout(() => {
      setCopied({ ...copied, [field]: false });
    }, 2000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmitProof = () => {
    // En una app real, aquí subirías el comprobante al servidor
    console.log("Comprobante enviado:", {
      file: uploadedFile,
      notes: notes,
      reference: referenceId,
      plan: plan,
      amount: price,
    });

    // Redirigir a página de confirmación
    navigate("/payment/pending");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/checkout?plan=" + plan.toLowerCase())}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Checkout
            </Button>
            <Badge variant="outline" className="text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              Transferencia Bancaria
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Instrucciones */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Datos para la Transferencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-yellow-800 dark:text-yellow-200">
                        Importante
                      </div>
                      <div className="text-yellow-700 dark:text-yellow-300 mt-1">
                        Usa exactamente estos datos y la referencia para que
                        podamos identificar tu pago.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos bancarios */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <div className="text-xs text-gray-500">Banco</div>
                      <div className="font-medium">{bankDetails.bankName}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <div className="text-xs text-gray-500">Titular</div>
                      <div className="font-medium">{bankDetails.holder}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <div className="text-xs text-gray-500">CBU</div>
                      <div className="font-mono">{bankDetails.cbu}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.cbu, "cbu")}
                    >
                      {copied.cbu ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <div className="text-xs text-gray-500">Alias</div>
                      <div className="font-medium">{bankDetails.alias}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(bankDetails.alias, "alias")
                      }
                    >
                      {copied.alias ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <div className="text-xs text-gray-500">CUIT</div>
                      <div className="font-mono">{bankDetails.cuit}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Referencia de pago */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200">
                  <div className="text-center">
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      REFERENCIA OBLIGATORIA
                    </div>
                    <div className="font-mono text-lg font-bold text-blue-800 dark:text-blue-200">
                      {referenceId}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(referenceId, "reference")}
                      className="mt-2 text-blue-600"
                    >
                      {copied.reference ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar Referencia
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instrucciones paso a paso */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pasos a Seguir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">
                        Realiza la transferencia
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Usa los datos bancarios proporcionados y la referencia
                        obligatoria
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Sube el comprobante</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Toma una foto o captura del comprobante de transferencia
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Confirmación</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Te enviaremos un email cuando confirmemos el pago
                        (24-48hs)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen y Upload */}
          <div className="space-y-6">
            {/* Resumen del pago */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">Plan {plan}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monto a transferir:</span>
                  <span className="font-bold text-lg">
                    ${price.toLocaleString()} {currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Referencia:</span>
                  <span className="font-mono text-sm">{referenceId}</span>
                </div>

                <Separator />

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  Tiempo de procesamiento: 24-48 horas hábiles
                </div>
              </CardContent>
            </Card>

            {/* Upload de comprobante */}
            <Card>
              <CardHeader>
                <CardTitle>Subir Comprobante</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file-upload" className="text-sm font-medium">
                    Comprobante de Transferencia *
                  </Label>
                  <div className="mt-2">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploadedFile ? (
                          <>
                            <FileText className="w-8 h-8 text-green-500 mb-2" />
                            <p className="text-sm text-green-600 font-medium">
                              {uploadedFile.name}
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">
                                Click para subir
                              </span>{" "}
                              o arrastra
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG o PDF (MAX. 5MB)
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Comentarios adicionales (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Cualquier información adicional que quieras agregar..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitProof}
                  disabled={!uploadedFile}
                  className="w-full"
                  size="lg"
                >
                  Enviar Comprobante
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  Al enviar el comprobante confirmas que realizaste la
                  transferencia por el monto exacto.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferInfo;
