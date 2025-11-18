import { useLocation, Link } from "react-router-dom";
import { SidebarLeft } from "@/components/layout/sidebar-left";
import { SidebarRight } from "@/components/layout/sidebar-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeModeToggle } from "@/components/theme-mode-toggle";

export function AppSidebar({ children }) {
  const location = useLocation();
  const isAutomationEditor = location.pathname === "/automation-editor";

  // Generar breadcrumbs jerárquicos
  const getBreadcrumbs = (pathname) => {
    const breadcrumbConfig = {
      "/": [{ title: "Dashboard", href: "/dashboard" }],
      "/dashboard": [{ title: "Dashboard", href: "/dashboard" }],
      "/device": [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Dispositivo", href: "/device" },
      ],
      "/charts": [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Gráficos", href: "/charts" },
      ],
      "/notifications": [{ title: "Notificaciones", href: "/notifications" }],
      "/rule-engine": [{ title: "Motor de Reglas", href: "/rule-engine" }],
      "/automation-editor": [
        { title: "Motor de Reglas", href: "/rule-engine" },
        { title: "Workshop de reglas", href: "/automation-editor" },
      ],
      "/device-config": [
        { title: "Configuración de Dispositivo", href: "/device-config" },
      ],
      "/profile": [{ title: "Perfil de Usuario", href: "/profile" }],
      "/payment-history": [
        { title: "Historial de Pagos", href: "/payment-history" },
      ],
    };

    return (
      breadcrumbConfig[pathname] || [{ title: "Dashboard", href: "/dashboard" }]
    );
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        {!isAutomationEditor && (
          <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 bg-background">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <BreadcrumbItem key={crumb.href}>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage className="line-clamp-1">
                          {crumb.title}
                        </BreadcrumbPage>
                      ) : (
                        <>
                          <BreadcrumbLink asChild>
                            <Link to={crumb.href} className="line-clamp-1">
                              {crumb.title}
                            </Link>
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
        )}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
      {!isAutomationEditor && <SidebarRight />}
    </SidebarProvider>
  );
}
