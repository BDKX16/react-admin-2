import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ChartDashboard from "./pages/ChartDashboard.jsx";
import ConfirmEmailChange from "./pages/ConfirmEmailChange.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import Subscription from "./pages/Subscription.jsx";
import Checkout from "./pages/Checkout.jsx";
import PaymentPending from "./pages/PaymentPending.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PaymentError from "./pages/PaymentError.jsx";
import TransferInfo from "./pages/TransferInfo.jsx";
import ClaimDevice from "./pages/ClaimDevice.jsx";
import { useSelector } from "react-redux";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DevicesProvider } from "./providers/DevicesProvider";

import { MqttProvider } from "./providers/MqttProvider";
import Notifications from "./pages/Notifications.jsx";
import RuleEngine from "./pages/RuleEngine.jsx";
import DeviceConfig from "./pages/DeviceConfig.jsx";
import AutomationEditor from "./pages/AutomationEditor.jsx";
import MainDashboard from "./pages/MainDashboard.jsx";
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
          element={userState?.token ? <Navigate to="/" /> : <Login />}
          caseSensitive={false}
        ></Route>
        <Route
          path="/confirm-email"
          element={<ConfirmEmailChange />}
          caseSensitive={false}
        ></Route>
        <Route
          path="/claim"
          element={<ClaimDevice />}
          caseSensitive={false}
        ></Route>
        <Route
          path="/subscription"
          element={
            userState?.token ? <Subscription /> : <Navigate to="/login" />
          }
          caseSensitive={false}
        ></Route>
        <Route
          path="/checkout"
          element={userState?.token ? <Checkout /> : <Navigate to="/login" />}
          caseSensitive={false}
        ></Route>
        <Route
          path="/payment/pending"
          element={
            userState?.token ? <PaymentPending /> : <Navigate to="/login" />
          }
          caseSensitive={false}
        ></Route>
        <Route
          path="/payment/success"
          element={
            userState?.token ? <PaymentSuccess /> : <Navigate to="/login" />
          }
          caseSensitive={false}
        ></Route>
        <Route
          path="/payment/error"
          element={
            userState?.token ? <PaymentError /> : <Navigate to="/login" />
          }
          caseSensitive={false}
        ></Route>
        <Route
          path="/payment/transfer-info"
          element={
            userState?.token ? <TransferInfo /> : <Navigate to="/login" />
          }
          caseSensitive={false}
        ></Route>
        <Route
          path="/*"
          element={
            userState?.token ? (
              <>
                <MqttProvider>
                  <DevicesProvider>
                    <SidebarProvider>
                      <AppSidebar>
                        <Routes>
                          <Route path={`/`} element={<MainDashboard />}></Route>
                          <Route
                            path={`/dashboard`}
                            element={<MainDashboard />}
                          ></Route>
                          <Route
                            path={`/device`}
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
                            path={`/automation-editor`}
                            element={<AutomationEditor />}
                          ></Route>
                          <Route
                            path={`/device-config`}
                            element={<DeviceConfig />}
                          ></Route>
                          <Route
                            path={`/profile`}
                            element={<UserProfile />}
                          ></Route>
                          <Route
                            path={`/payment-history`}
                            element={<PaymentHistory />}
                          ></Route>
                          <Route
                            path={`/*`}
                            element={<MainDashboard />}
                          ></Route>
                        </Routes>
                      </AppSidebar>
                    </SidebarProvider>
                  </DevicesProvider>
                </MqttProvider>
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Layout;
