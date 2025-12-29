import { get } from "datagovmy-ui/api";
import { Metadata } from "datagovmy-ui/components";
import { SHORT_LANG } from "datagovmy-ui/constants";
import { AnalyticsProvider } from "datagovmy-ui/contexts/analytics";
import { WindowProvider } from "datagovmy-ui/contexts/window";
import { withi18n } from "datagovmy-ui/decorators";
import { useTranslation } from "datagovmy-ui/hooks";
import { Page } from "datagovmy-ui/types";
import PublicationsLayout from "misc/publications/layout";
import UpcomingPublicationsDashboard from "misc/publications/upcoming";
import { GetStaticProps, InferGetStaticPropsType } from "next";

const UpcomingPublications: Page = ({
  list_pubs,
  meta,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["publications", "common"]);

  return (
    <AnalyticsProvider meta={meta}>
      <Metadata title={t("header")} description={t("description")} keywords={""} />
      <PublicationsLayout>
        <WindowProvider>
          <UpcomingPublicationsDashboard list_pubs={list_pubs} />
        </WindowProvider>
      </PublicationsLayout>
    </AnalyticsProvider>
  );
};

export const getStaticProps: GetStaticProps = withi18n(["publications"], async ({ locale }) => {
  try {
    const { data: list } = await get(
      `/pub/upcoming_${SHORT_LANG[locale as keyof typeof SHORT_LANG]}.json`,
      {},
      "api_s3"
    );

    return {
      notFound: false,
      props: {
        meta: {
          id: "publications",
          type: "dashboard",
          category: null,
          agency: "DOSM",
        },
        list_pubs: list.results,
      },
    };
  } catch (e: any) {
    return { notFound: true };
  }
});

export default UpcomingPublications;
