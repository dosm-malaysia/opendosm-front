import { CatalogueIndex as DataCatalogue, Catalogue } from "datagovmy-ui/data-catalogue";
import { get } from "datagovmy-ui/api";
import { Metadata } from "datagovmy-ui/components";
import { SHORT_LANG } from "datagovmy-ui/constants";
import { withi18n } from "datagovmy-ui/decorators";
import { sortAlpha } from "datagovmy-ui/helpers";
import { useTranslation } from "datagovmy-ui/hooks";
import { Page } from "datagovmy-ui/types";
import { GetStaticProps, InferGetStaticPropsType } from "next";

const CatalogueIndex: Page = ({
  collection,
  sources,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["catalogue", "common"]);

  return (
    <>
      <Metadata title={t("header")} description={t("description")} keywords={""} />
      <DataCatalogue collection={collection} sources={sources} site="opendosm" />
    </>
  );
};

const recurSort = (data: Record<string, Catalogue[]> | Catalogue[]): any => {
  if (Array.isArray(data)) return sortAlpha(data, "title");

  return Object.fromEntries(
    Object.entries(data)
      .sort((a: [string, unknown], b: [string, unknown]) => a[0].localeCompare(b[0]))
      .map((item: [string, Record<string, Catalogue[]> | Catalogue[]]) => [
        item[0],
        recurSort(item[1]),
      ])
  );
};

export const getStaticProps: GetStaticProps = withi18n("catalogue", async ({ locale }) => {
  try {
    const { data } = await get(
      `/catalogue/index_${SHORT_LANG[locale as keyof typeof SHORT_LANG]}.json`,
      {},
      "api_s3"
    );

    // const collection = recurSort(data.dataset);
    const collection = data.datasets;

    return {
      props: {
        meta: {
          id: "catalogue-index",
          type: "misc",
          category: null,
          agency: null,
        },
        sources: data.source_filters.sort((a: string, b: string) => a.localeCompare(b)),
        collection,
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
});

export default CatalogueIndex;
