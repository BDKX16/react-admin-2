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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  shadow-md overflow-hidden border-trace-card rounded-none border-2 border-transparent h-full
                  ${isSelected ? "bg-green-500/10 shadow-xl" : ""}
                `}
              >
                {/* Bordes animados en hover */}
                <span className="border-bottom"></span>
                <span className="border-left"></span>
                <span className="border-right"></span>
                <span className="border-top-left"></span>
                <span className="border-top-right"></span>
                <style>{`
                  .border-trace-card {
                    position: relative;
                  }
                  .border-bottom,
                  .border-left,
                  .border-right,
                  .border-top-left,
                  .border-top-right {
                    position: absolute;
                    background: rgb(34 197 94 / 0.5);
                    opacity: 0;
                    pointer-events: none;
                  }
                  
                  /* Borde inferior - se expande desde el centro */
                  .border-bottom {
                    bottom: 0;
                    left: 50%;
                    height: 2px;
                    width: 0;
                    transform: translateX(-50%);
                  }
                  .group:hover .border-bottom {
                    opacity: 1;
                    animation: expand-horizontal 0.2s ease-out forwards;
                  }
                  
                  /* Bordes laterales - suben en paralelo */
                  .border-left {
                    bottom: 0;
                    left: 0;
                    width: 2px;
                    height: 0;
                  }
                  .border-right {
                    bottom: 0;
                    right: 0;
                    width: 2px;
                    height: 0;
                  }
                  .group:hover .border-left,
                  .group:hover .border-right {
                    opacity: 1;
                    animation: expand-vertical 0.4s ease-out 0.2s forwards;
                  }
                  
                  /* Bordes superiores - se cierran desde los costados */
                  .border-top-left {
                    top: 0;
                    left: 0;
                    height: 2px;
                    width: 0;
                  }
                  .border-top-right {
                    top: 0;
                    right: 0;
                    height: 2px;
                    width: 0;
                  }
                  .group:hover .border-top-left,
                  .group:hover .border-top-right {
                    opacity: 1;
                    animation: expand-horizontal-half 0.2s ease-out 0.6s forwards;
                  }
                  
                  @keyframes expand-horizontal {
                    to { width: 100%; }
                  }
                  @keyframes expand-horizontal-half {
                    to { width: 50%; }
                  }
                  @keyframes expand-vertical {
                    to { height: 100%; }
                  }
                `}</style>
                <RadioGroupItem
                  value={crop.id}
                  id={crop.id}
                  className="sr-only"
                />
                <div className="space-y-4 flex flex-col items-center text-center relative z-10 h-full">
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
                  <div className="space-y-1 flex-1 flex flex-col justify-start">
                    <h3 className="font-semibold text-base leading-tight">
                      {crop.label}
                    </h3>
                    <p className="text-sm text-muted-foreground min-h-[2.5rem]">
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
