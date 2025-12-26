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
import { useEffect, useState } from "react";

interface TotalDownloads {
  publication_id: string;
  resource_id: string;
  total_downloads: number;
}

const BrowsePublications: Page = ({
  meta,
  pub,
  publications,
  params,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["publications", "common"]);
  const [totalDownloads, setTotalDownloads] = useState<TotalDownloads[]>([]);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_TINYBIRD_URL}/pipes/publication_dls_by_pub_res.json`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TINYBIRD_TOKEN}`,
            },
          }
        );
        const { data } = await response.json();
        setTotalDownloads(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchViews();
  }, []);

  return (
    <AnalyticsProvider meta={meta}>
      <Metadata
        title={pub ? pub.title : t("header")}
        description={pub ? pub.description : t("description")}
        keywords={""}
      />
      <PublicationsLayout>
        <WindowProvider>
          <BrowsePublicationsDashboard
            pub={
              pub
                ? {
                    ...pub,
                    resources: pub.resources.map(resource => ({
                      ...resource,
                      downloads:
                        totalDownloads.find(
                          list =>
                            list.publication_id === params.pub_id &&
                            Number(list.resource_id) === resource.resource_id
                        )?.total_downloads ?? 0,
                    })),
                  }
                : null
            }
            publications={publications.map((item: Publication) => ({
              ...item,
              total_downloads: totalDownloads
                .filter(list => list.publication_id === item.publication_id)
                .reduce((prev, curr) => prev + curr.total_downloads, 0),
            }))}
            params={params}
          />
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
      const { data } = await get("/publication/", { language: locale });

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
          pub: pub ? pub.data : null,
          publications:
            data.results.sort(
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
