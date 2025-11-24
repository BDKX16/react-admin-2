import * as React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Clock, PartyPopper, Sprout } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { initialTour } from "@/config/tours";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WELCOME_MODAL_STORAGE_KEY = "confi_welcome_modal_shown";
const WELCOME_MODAL_POSTPONE_KEY = "confi_welcome_modal_postponed";

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { startTour, completeTour } = useOnboarding();
  const [isStartingTour, setIsStartingTour] = useState(false);

  // Verificar si es la segunda vez que se muestra (ya fue pospuesto una vez)
  const isSecondTime =
    localStorage.getItem(WELCOME_MODAL_POSTPONE_KEY) !== null;

  // Función para iniciar el tour de bienvenida
  const handleStartTour = () => {
    setIsStartingTour(true);

    // Marcar el modal como mostrado (ya no se volverá a mostrar)
    localStorage.setItem(WELCOME_MODAL_STORAGE_KEY, "true");
    localStorage.removeItem(WELCOME_MODAL_POSTPONE_KEY);

    // Cerrar el modal
    onOpenChange(false);

    // Iniciar el tour de bienvenida
    setTimeout(() => {
      startTour("initial", initialTour);
      setIsStartingTour(false);
    }, 300);
  };

  // Función para posponer o cerrar permanentemente
  const handlePostpone = () => {
    if (isSecondTime) {
      // Segunda vez: no volver a mostrar
      localStorage.setItem(WELCOME_MODAL_STORAGE_KEY, "true");
      localStorage.removeItem(WELCOME_MODAL_POSTPONE_KEY);
    } else {
      // Primera vez: posponer hasta mañana a las 00:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      localStorage.setItem(
        WELCOME_MODAL_POSTPONE_KEY,
        tomorrow.getTime().toString()
      );

      // Mostrar mini tour del botón de ayuda después de 500ms
      setTimeout(() => {
        startTour("initial", [
          {
            element: '[data-tour="tour-menu-button"]',
            popover: {
              title: "📚 Guías y Tours",
              description:
                "Siempre puedes acceder a las guías desde este botón. Te ayudaremos a conocer todas las funcionalidades de tu panel.",
              side: "left",
              align: "end",
            },
          },
        ]);
      }, 500);
    }

    // Cerrar el modal
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            ¡Bienvenido a tu panel de Confi!
          </DialogTitle>
          <DialogDescription className="text-left text-base pt-2 space-y-3">
            <p>
              Este recorrido te mostrará, paso a paso, cómo aprovechar al máximo
              tus dispositivos y herramientas. La idea es simple: que te sientas
              cómodo, descubras rápido lo esencial y tengas todo bajo control
              sin complicaciones.
            </p>
            <p className="font-medium flex items-center gap-2">
              Explora, aprende y disfruta mientras tu cultivo se vuelve más
              inteligente.
              <Sprout className="h-4 w-4" />
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* Video de bienvenida */}
        <div
          className="w-full bg-muted rounded-lg overflow-hidden my-4"
          style={{ aspectRatio: "1100/720" }}
        >
          <video
            className="w-full h-full object-cover"
            poster="/assets/welcome-video-poster.jpg"
            controls
            playsInline
          >
            <source src="/assets/welcome-tour.mp4" type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-4">
          ¿Querés hacer un tour para conocer cómo funciona la aplicación?
        </p>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handlePostpone}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <Clock className="mr-2 h-4 w-4" />
            {isSecondTime ? "No volver a mostrar" : "Más tarde"}
          </Button>
          <Button
            onClick={handleStartTour}
            disabled={isStartingTour}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            <Play className="mr-2 h-4 w-4" />
            Iniciar tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook para controlar cuándo mostrar el modal
export const useWelcomeModal = () => {
  const [showModal, setShowModal] = useState(false);
  const { hasCompletedOnboarding } = useOnboarding();

  useEffect(() => {
    // Verificar si el usuario acaba de completar el onboarding
    const justCompletedOnboarding = sessionStorage.getItem(
      "just_completed_onboarding"
    );

    if (justCompletedOnboarding === "true") {
      // Limpiar el flag
      sessionStorage.removeItem("just_completed_onboarding");

      // Verificar si ya completó el tour inicial en base de datos - si lo completó, no mostrar el modal
      if (hasCompletedOnboarding("inicio")) {
        return; // El usuario ya completó el tour, no mostrar nada
      }

      // Verificar si está pospuesto con timestamp
      const postponedUntil = localStorage.getItem(WELCOME_MODAL_POSTPONE_KEY);
      if (postponedUntil) {
        try {
          const postponeTimestamp = parseInt(postponedUntil, 10);
          const now = Date.now();

          if (now < postponeTimestamp) {
            // Todavía está pospuesto
            return;
          } else {
            // Ya pasó el tiempo de posposición, limpiar y mostrar
            localStorage.removeItem(WELCOME_MODAL_POSTPONE_KEY);
          }
        } catch {
          // Si hay error parseando, limpiar el valor corrupto
          localStorage.removeItem(WELCOME_MODAL_POSTPONE_KEY);
        }
      }

      // Verificar si ya se mostró permanentemente (cuando el usuario inicia el tour)
      const alreadyShown = localStorage.getItem(WELCOME_MODAL_STORAGE_KEY);
      if (alreadyShown === "true") {
        return; // Ya inició el tour, no volver a mostrar
      }

      // Mostrar el modal
      setShowModal(true);
    }
  }, [hasCompletedOnboarding]);

  return { showModal, setShowModal };
};

export default WelcomeModal;
