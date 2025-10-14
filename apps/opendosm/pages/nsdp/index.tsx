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

const NationalSummaryDataPage: Page = ({
  meta,
  download,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["nsdp"]);

  return (
    <AnalyticsProvider meta={meta}>
      <Metadata title={t("header")} description={t("description")} keywords={""} />
      <NationalSummaryDataPageLayout>
        {tab_index => (
          <Container className="w-full flex divide-y-0">
            <div className="flex-1">
              {
                {
                  download: <NationalSummaryDataPageDownload download={download} />,
                  real: <div>hi2</div>,
                  fiscal: <div>hi3</div>,
                  financial: <div>hi4</div>,
                  external: <div>hi5</div>,
                  socio: <div>hi6</div>,
                  arc: <div>hi7</div>,
                }[tab_index]
              }
            </div>
            {tab_index !== "download" && <div>render sidebar</div>}
          </Container>
        )}
      </NationalSummaryDataPageLayout>
    </AnalyticsProvider>
  );
};

export const getStaticProps: GetStaticProps = withi18n("nsdp", async ({ locale }) => {
  const { data: download } = await get(
    `/sdmx/download_${SHORT_LANG_ALT[locale]}.json`,
    undefined,
    "api_s3"
  );

  return {
    notFound: false,
    props: {
      meta: {
        id: "nsdp",
        type: "dashboard",
        category: "rate-statistics",
        agency: "DOSM",
      },
      download,
    },
  };
});

export default NationalSummaryDataPage;
