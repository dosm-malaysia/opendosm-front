import { get } from "datagovmy-ui/api";
import { Metadata, PubResource } from "datagovmy-ui/components";
import { AnalyticsProvider } from "datagovmy-ui/contexts/analytics";
import { WindowProvider } from "datagovmy-ui/contexts/window";
import { withi18n } from "datagovmy-ui/decorators";
import { useTranslation } from "datagovmy-ui/hooks";
import { Page } from "datagovmy-ui/types";
import BrowsePublicationsDashboard from "misc/publications/browse";
import { Publication } from "datagovmy-ui/components";
import PublicationsLayout from "misc/publications/layout";
import { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from "next";
import { AxiosResponse } from "axios";

const BrowsePublications: Page = ({
  meta,
  pub,
  publications,
  params,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["publications", "common"]);

  return (
    <AnalyticsProvider meta={meta}>
      <Metadata
        title={pub ? pub.title : t("header")}
        description={pub ? pub.description : t("description")}
        keywords={""}
      />
      <PublicationsLayout>
        <WindowProvider>
          <BrowsePublicationsDashboard pub={pub} publications={publications} params={params} />
        </WindowProvider>
      </PublicationsLayout>
    </AnalyticsProvider>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = withi18n(
  ["publications", "catalogue"],
  async ({ locale, params }) => {
    try {
      const pub_id = params.pub_id ? params.pub_id[0] : "";
      const [{ data }, response] = await Promise.all([
        get("/publication/", {
          language: locale,
        }),
        // TODO: this will be fetched on client
        fetch(`${process.env.NEXT_PUBLIC_TINYBIRD_URL}/pipes/publication_dls_by_pub_res.json`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TINYBIRD_TOKEN}`,
          },
        }),
      ]).catch(e => {
        throw new Error("Invalid filter. Message: " + e);
      });

      const { data: total_downloads } = await response.json();

      const pub: AxiosResponse<PubResource> | null = pub_id
        ? await get(`/publication-resource/${pub_id}`, {
            language: locale,
          })
        : null;

      return {
        notFound: false,
        props: {
          meta: {
            id: "publications",
            type: "dashboard",
            category: null,
            agency: "DOSM",
          },
          pub: pub
            ? {
                ...pub.data,
                resources: pub.data.resources.map(resource => ({
                  ...resource,
                  downloads:
                    total_downloads.find(
                      list =>
                        list.publication_id === pub_id &&
                        Number(list.resource_id) === resource.resource_id
                    )?.total_downloads ?? 0,
                })),
              }
            : null,
          publications:
            data.results
              .map((item: Publication) => ({
                ...item,
                total_downloads: total_downloads
                  .filter(list => list.publication_id === item.publication_id)
                  .reduce((prev, curr) => prev + curr.total_downloads, 0),
              }))
              .sort(
                (a: Publication, b: Publication) =>
                  Date.parse(b.release_date) - Date.parse(a.release_date)
              ) ?? [],
          params: { pub_id },
        },
      };
    } catch (e: any) {
      return { notFound: true };
    }
  }
);

export default BrowsePublications;
