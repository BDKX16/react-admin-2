import React from "react";

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ChartDashboard from "./pages/ChartDashboard.jsx";
import { useSelector } from "react-redux";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
const Layout = () => {
  const userState = useSelector((state) => state.user);
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={userState.user ? <Navigate to="/" /> : <Login />}
          caseSensitive={false}
        ></Route>
        <Route
          path="/*"
          element={
            <SidebarProvider>
              <AppSidebar>
                <Routes>
                  <Route path={`/dash`} element={<Dashboard />}></Route>
                  <Route path={`/*`} element={<ChartDashboard />}></Route>
                </Routes>
              </AppSidebar>
            </SidebarProvider>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
