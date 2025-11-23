import React from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Sprout, Tent, Home } from "lucide-react";

const cropTypes = [
  {
    id: "microgreens",
    label: "Micro cultivo / Microgreens",
    icon: Sprout,
    description: "Para cultivos pequeños de crecimiento rápido",
  },
  {
    id: "greenhouse",
    label: "Carpa de cultivo",
    icon: Tent,
    description: "Ideal para carpas y espacios semi-cerrados",
  },
  {
    id: "grow-room",
    label: "Cuarto de cultivo / Invernadero",
    icon: Home,
    description: "Para espacios cerrados y controlados",
  },
];

const CropTypeSelector = ({ value, onChange }) => {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-500 delay-200">
        {cropTypes.map((crop) => {
          const Icon = crop.icon;
          const isSelected = value === crop.id;

          return (
            <Label
              key={crop.id}
              htmlFor={crop.id}
              className="cursor-pointer group"
            >
              <Card
                className={`
                  relative p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                  border-0 shadow-md rounded-none
                  ${isSelected ? "bg-green-500/10 shadow-xl" : ""}
                `}
              >
                <RadioGroupItem
                  value={crop.id}
                  id={crop.id}
                  className="sr-only"
                />
                <div className="space-y-4 flex flex-col items-center text-center">
                  <div
                    className={`
                    w-16 h-16 rounded-lg flex items-center justify-center
                    transition-colors duration-300
                    ${
                      isSelected
                        ? "bg-green-500 text-white"
                        : "bg-muted group-hover:bg-green-100 dark:group-hover:bg-green-950"
                    }
                  `}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base leading-tight">
                      {crop.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {crop.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Label>
          );
        })}
      </div>
    </RadioGroup>
  );
};

export default CropTypeSelector;
