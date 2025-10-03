import "datagovmy-ui/styles";
import Nexti18NextConfig from "../next-i18next.config";
import Layout from "@components/Layout";
import { Progress, Toast } from "datagovmy-ui/components";
import { body, header } from "datagovmy-ui/configs/font";
import { WindowProvider } from "datagovmy-ui/contexts/window";
import { clx } from "datagovmy-ui/helpers";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { AppPropsLayout } from "datagovmy-ui/types";

// App instance
function App({ Component, pageProps }: AppPropsLayout) {
  const layout =
    Component.layout ||
    ((page: ReactNode) => (
      <Layout
        className={clx(body.variable, "font-sans")}
        banner={{
          namespace: "common",
          key: "common.opendosm_banner",
        }}
      >
        {page}
      </Layout>
    ));

  return (
    <ThemeProvider attribute="class" enableSystem={false} forcedTheme={Component.theme}>
      <WindowProvider>
        {layout(
          <div className={clx(body.variable, header.variable, "font-sans")}>
            <Component {...pageProps} />
          </div>,
          pageProps
        )}
        <Progress />
        <Toast />
      </WindowProvider>
    </ThemeProvider>
  );
}

export default appWithTranslation(App, Nexti18NextConfig);
