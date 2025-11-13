class GoogleAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.isInitialized = false;
  }

  /**
   * Check if running in an in-app browser (Instagram, Facebook, etc.)
   */
  isInAppBrowser() {
    const ua = navigator.userAgent || navigator.vendor;
    return /Instagram|FBAN|FBAV/i.test(ua);
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      // Verificar si Google Identity Services está disponible
      const checkGoogle = () => {
        if (window.google?.accounts?.id) {
          this.isInitialized = true;

          // Inicializar Google Identity Services
          window.google.accounts.id.initialize({
            client_id: this.clientId,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: false,
          });

          resolve();
        } else {
          setTimeout(checkGoogle, 100);
        }
      };

      checkGoogle();

      // Timeout después de 5 segundos
      setTimeout(() => {
        if (!this.isInitialized) {
          reject(new Error("Google Identity Services no se pudo cargar"));
        }
      }, 5000);
    });
  }

  handleCredentialResponse(response) {
    // Este método será sobrescrito cuando se use
    console.log("Credential received:", response);
  }

  async signIn() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // If in-app browser, show message to open in regular browser
    if (this.isInAppBrowser()) {
      const message =
        "Para iniciar sesión con Google, abrí este sitio en tu navegador principal:\n\n" +
        "1. Tocá los tres puntos (⋯) arriba a la derecha\n" +
        "2. Seleccioná 'Abrir en navegador' o 'Open in Chrome/Safari'\n\n" +
        "Los navegadores de Instagram/Facebook bloquean el inicio de sesión de Google por seguridad.";

      alert(message);
      throw new Error("In-app browser detected");
    }

    return new Promise((resolve, reject) => {
      // Sobrescribir el callback para esta instancia específica
      this.handleCredentialResponse = (response) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error("No se recibió credencial de Google"));
        }
      };

      // Re-inicializar con el nuevo callback
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: false,
      });

      // Mostrar prompt de Google
      window.google.accounts.id.prompt((notification) => {
        console.log("🔔 Prompt notification:", notification);
        console.log("📊 Notification details:", {
          isDisplayed: !notification.isNotDisplayed(),
          isSkipped: notification.isSkippedMoment(),
          reason:
            notification.getNotDisplayedReason?.() ||
            notification.getSkippedReason?.(),
          moment: notification.getMomentType?.(),
        });

        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason?.();
          console.error("❌ Popup no mostrado. Razón:", reason);

          if (reason === "unregistered_origin") {
            reject(
              new Error(
                "origin not allowed - El origin http://localhost:5173 no está autorizado en Google Cloud Console"
              )
            );
          } else {
            reject(
              new Error(`El popup de Google no se pudo mostrar: ${reason}`)
            );
          }
        } else if (notification.isSkippedMoment()) {
          const reason = notification.getSkippedReason?.();
          console.warn("⚠️ Popup omitido. Razón:", reason);
          reject(new Error(`El popup fue omitido: ${reason}`));
        }
      });
    });
  }

  renderButton(elementId, options = {}) {
    if (!this.isInitialized || !document.getElementById(elementId)) {
      return false;
    }

    const defaultOptions = {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
      ...options,
    };

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      defaultOptions
    );

    return true;
  }
}

// Exportar una instancia única
export const googleAuthService = new GoogleAuthService();
