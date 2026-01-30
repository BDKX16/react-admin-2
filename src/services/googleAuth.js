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

  /**
   * Sign in with redirect flow (works in in-app browsers)
   */
  signInWithRedirect() {
    const redirectUri = window.location.origin + "/login";
    const scope = "email profile openid";
    const responseType = "token id_token";
    const nonce = Math.random().toString(36).substring(7);

    // Store current location to redirect back after login
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=${encodeURIComponent(responseType)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&nonce=${nonce}` +
      `&prompt=select_account`;

    window.location.href = authUrl;
  }

  /**
   * Handle redirect callback and extract token
   */
  handleRedirectCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get("id_token");

    if (idToken) {
      // Clear hash from URL
      window.history.replaceState(null, "", window.location.pathname);
      return idToken;
    }

    return null;
  }

  async signIn() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Use redirect flow for in-app browsers
    if (this.isInAppBrowser()) {
      console.log("📱 In-app browser detected, using redirect flow");
      this.signInWithRedirect();
      return new Promise(() => {}); // Never resolves as we redirect
    }

    return new Promise((resolve, reject) => {
      let isResolved = false;
      let timeoutId = null;

      // Sobrescribir el callback para esta instancia específica
      this.handleCredentialResponse = (response) => {
        if (isResolved) return;
        isResolved = true;
        if (timeoutId) clearTimeout(timeoutId);

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

      // Timeout para fallback a redirect
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          console.warn("⚠️ Popup timeout, using redirect flow as fallback");
          isResolved = true;
          this.signInWithRedirect();
          // No resolvemos ni rechazamos, solo redirigimos
        }
      }, 3000);

      // Mostrar prompt de Google
      window.google.accounts.id.prompt((notification) => {
        if (isResolved) return;

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
          console.warn("⚠️ Popup no mostrado. Razón:", reason, "- usando redirect");

          // En lugar de rechazar, usar redirect como fallback
          isResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          
          // Usar redirect flow como fallback automático
          console.log("🔄 Usando redirect flow como alternativa...");
          this.signInWithRedirect();
        } else if (notification.isSkippedMoment()) {
          const reason = notification.getSkippedReason?.();
          console.warn("⚠️ Popup omitido. Razón:", reason, "- usando redirect");
          
          // En lugar de rechazar, usar redirect como fallback
          isResolved = true;
          if (timeoutId) clearTimeout(timeoutId);
          
          // Usar redirect flow como fallback automático
          console.log("🔄 Usando redirect flow como alternativa...");
          this.signInWithRedirect();
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
