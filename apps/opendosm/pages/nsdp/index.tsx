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
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["nsdp"]);
  return (
    <AnalyticsProvider meta={meta}>
      <WindowProvider>
        <Metadata title={t("header")} description={t("description")} keywords={""} />
        <NationalSummaryDataPageLayout>
          {(tab_index, chartColor) => (
            <Container className="w-full flex divide-y-0">
              <div className="flex-1">
                {
                  {
                    download: <NationalSummaryDataPageDownload download={download} />,
                    real: <NSDPReal real={real} chartColor={chartColor} />,
                    fiscal: (
                      <NSDPFiscal
                        categories={[
                          ["government-revenue", []],
                          ["government-expenditure", []],
                          ["budget-deficit", []],
                        ]}
                      />
                    ),
                    financial: (
                      <NSDPFinancial
                        categories={[
                          ["banking-sector", []],
                          ["capital-markets", []],
                          ["financial-inclusion", []],
                        ]}
                      />
                    ),
                    external: (
                      <NSDPExternal
                        categories={[
                          ["trade-balance", []],
                          ["foreign-investment", []],
                          ["exchange-rates", []],
                        ]}
                      />
                    ),
                    socio: (
                      <NSDPSocio
                        categories={[
                          ["population-demographics", []],
                          ["education-indicators", []],
                          ["health-outcomes", []],
                        ]}
                      />
                    ),
                    arc: (
                      <NSDPArc
                        categories={[
                          ["research-development", []],
                          ["innovation-index", []],
                          ["technology-adoption", []],
                        ]}
                      />
                    ),
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
  ]).catch(e => {
    throw new Error(e);
  });

  const [download, real] = results.map(e => {
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
    },
  };
});

export default NationalSummaryDataPage;
