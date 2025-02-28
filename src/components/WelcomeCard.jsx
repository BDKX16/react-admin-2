import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Import the Input component
import { useState } from "react";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { newDevice } from "@/services/public";
import { enqueueSnackbar } from "notistack";

const WelcomeCard = () => {
  const [serialInput, setSerialInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const { loading, callEndpoint } = useFetchAndLoad();

  const handleSubmit = async () => {
    if (serialInput.length == 10 && nameInput != "") {
      let data = await callEndpoint(newDevice(serialInput, nameInput));

      if (data.error == false) {
        enqueueSnackbar("Dispositivo agregado: " + nameInput, {
          variant: "success",
        });

        setSerialInput("");
        setNameInput("");
      }
      return;
    } else {
      enqueueSnackbar("Datos invalidos", { variant: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="max-w-xl rounded-lg shadow-xl p-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 flex flex-col md:flex-row gap-2 justify-center items-center">
          <p>Bienvenido a</p>
          <p className="text-green-500"> Confi Plant</p>
        </h1>
        <p className="mb-8">
          Parece que aún no tienes dispositivos cargados. Para comenzar, añade
          tu primer dispositivo y descubre todas las funciones de monitorización
          y control en tiempo real.
        </p>
        <Input
          placeholder="Ej: a1b2c3d4e5"
          value={serialInput}
          onChange={(e) => setSerialInput(e.target.value)}
          className="mb-4"
        />
        <Input
          placeholder="Nombre del dispositivo"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="mb-4"
        />
        <Button
          className="px-6 py-3 rounded-md transition"
          onClick={handleSubmit}
          disabled={loading}
        >
          Añadir Dispositivo
        </Button>
      </Card>
    </div>
  );
};

export default WelcomeCard;
