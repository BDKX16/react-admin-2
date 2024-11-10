import PropTypes from "prop-types";

import { ThemeProvider } from "@/providers/theme-provider";

import store from "./redux/store";
import { Provider } from "react-redux";
import { SnackbarProvider } from "notistack";
import Layout from "./Layout";
import { AuthProvider } from "./providers/AuthProvider";

function App({ children }) {
  return (
    <SnackbarProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Provider store={store}>
          <AuthProvider>
            <Layout />
          </AuthProvider>
        </Provider>
      </ThemeProvider>
    </SnackbarProvider>
  );
}
App.propTypes = {
  children: PropTypes.node,
};

export default App;
