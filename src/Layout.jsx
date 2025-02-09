import React from "react";

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ChartDashboard from "./pages/ChartDashboard.jsx";
import { useSelector } from "react-redux";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DevicesProvider } from "./providers/DevicesProvider";

import { MqttProvider } from "./providers/MqttProvider";
import Notifications from "./pages/Notifications.jsx";
import RuleEngine from "./pages/RuleEngine.jsx";
import DeviceConfig from "./pages/DeviceConfig.jsx";
const Layout = () => {
  const userState = useSelector((state) => state.user);

  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <Routes>
        <Route
          path="/login"
          element={userState.user ? <Navigate to="/" /> : <Login />}
          caseSensitive={false}
        ></Route>
        <Route
          path="/*"
          element={
            <MqttProvider>
              <DevicesProvider>
                <SidebarProvider>
                  <AppSidebar>
                    <Routes>
                      <Route
                        path={`/dashboard`}
                        element={<Dashboard />}
                      ></Route>
                      <Route
                        path={`/charts`}
                        element={<ChartDashboard />}
                      ></Route>
                      <Route
                        path={`/notifications`}
                        element={<Notifications />}
                      ></Route>
                      <Route
                        path={`/rule-engine`}
                        element={<RuleEngine />}
                      ></Route>
                      <Route
                        path={`/device-config`}
                        element={<DeviceConfig />}
                      ></Route>
                      <Route path={`/*`} element={<Dashboard />}></Route>
                    </Routes>
                  </AppSidebar>
                </SidebarProvider>
              </DevicesProvider>
            </MqttProvider>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
