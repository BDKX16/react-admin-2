declare module "@/hooks/useAuth" {
  export function useAuth(): {
    auth: {
      token: string;
      userData: {
        name: string;
        email: string;
        avatar: string;
      };
    };
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    // Agrega otras propiedades y métodos según sea necesario
  };
}
