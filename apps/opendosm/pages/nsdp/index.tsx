import { GetStaticProps, InferGetStaticPropsType } from "next";
import { get } from "datagovmy-ui/api";
import { Page } from "datagovmy-ui/types";
import { Container, Metadata } from "datagovmy-ui/components";
import { useTranslation } from "datagovmy-ui/hooks";
import { withi18n } from "datagovmy-ui/decorators";
import { AnalyticsProvider } from "datagovmy-ui/contexts/analytics";
import NationalSummaryDataPageLayout from "misc/nsdp/layout";
import NationalSummaryDataPageDownload from "misc/nsdp/download";
import { SHORT_LANG_ALT } from "datagovmy-ui/constants";
import NSDPReal from "misc/nsdp/real";
import NSDPFiscal from "misc/nsdp/fiscal";
import NSDPFinancial from "misc/nsdp/financial";
import NSDPExternal from "misc/nsdp/external";
import NSDPSocio from "misc/nsdp/socio";
import NSDPArc from "misc/nsdp/arc";
import { WindowProvider } from "datagovmy-ui/contexts/window";

const NationalSummaryDataPage: Page = ({
  meta,
  download,
  real,
  // fiscal, financial, external, socio, arc
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t, i18n } = useTranslation(["nsdp"]);
  return (
    <AnalyticsProvider meta={meta}>
      <WindowProvider>
        <Metadata
          title={t("header")}
          description={t("description")}
          keywords={""}
          image={`${process.env.NEXT_PUBLIC_API_S3_URL}/sdmx/og_${SHORT_LANG_ALT[i18n.language]}.png`}
        />
        <NationalSummaryDataPageLayout>
          {(tab_index, chartColor) => (
            <Container className="w-full flex divide-y-0">
              <div className="flex-1">
                {
                  {
                    download: <NationalSummaryDataPageDownload download={download} />,
                    real: <NSDPReal real={real} chartColor={chartColor} />,
                    fiscal: <NSDPFiscal fiscal={real} chartColor={chartColor} />,
                    financial: <NSDPFinancial financial={real} chartColor={chartColor} />,
                    external: <NSDPExternal external={real} chartColor={chartColor} />,
                    socio: <NSDPSocio socio={real} chartColor={chartColor} />,
                    arc: <NSDPArc arc={real} chartColor={chartColor} />,
                  }[tab_index]
                }
              </div>
            </Container>
          )}
        </NationalSummaryDataPageLayout>
      </WindowProvider>
    </AnalyticsProvider>
  );
};

export const getStaticProps: GetStaticProps = withi18n("nsdp", async ({ locale }) => {
  const results = await Promise.allSettled([
    get(`/sdmx/download_${SHORT_LANG_ALT[locale]}.json`, undefined, "api_s3"),
    get(`/sdmx/dashboard-real.json`, undefined, "api_s3"),
    // Add file fetching here
    // get(`/sdmx/dashboard-fiscal.json`, undefined, "api_s3"),
    // get(`/sdmx/dashboard-financial.json`, undefined, "api_s3"),
    // get(`/sdmx/dashboard-external.json`, undefined, "api_s3"),
    // get(`/sdmx/dashboard-socio.json`, undefined, "api_s3"),
    // get(`/sdmx/dashboard-arc.json`, undefined, "api_s3"),
  ]).catch(e => {
    throw new Error(e);
  });

  const [
    download,
    real,
    // fiscal, financial, external, socio, arc
  ] = results.map(e => {
    if (e.status === "rejected") return null;
    else return e.value.data;
  });

  return {
    notFound: false,
    props: {
      meta: {
        id: "nsdp",
        type: "dashboard",
        category: "summary",
        agency: "DOSM",
      },
      download,
      real,
      // fiscal, financial, external, socio, arc
    },
  };
});

export default NationalSummaryDataPage;
