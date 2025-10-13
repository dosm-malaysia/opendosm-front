import { Button, Section } from "datagovmy-ui/components";
import { useTranslation } from "datagovmy-ui/hooks";
import { FunctionComponent } from "react";
import dynamic from "next/dynamic";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { ExcelIcon } from "datagovmy-ui/icons";
import NationalSummaryDataPageTable from "./table";

const Table = dynamic(() => import("datagovmy-ui/charts/table"), { ssr: false });

export interface DownloadItem {
  title: string | null;
  title_link: string | null;
  category: string | null;
  as_of: string | null;
  last_updated: string | null;
  next_update: string | null;
  sdmx_xml: string | null;
  sdmx_json: string | null;
  sdmx_csv: string | null;
  sdmx_parquet: string | null;
  sdmx_excel: string | null;
}

type DownloadTabProps = {
  download: DownloadItem[];
};

const NationalSummaryDataPageDownload: FunctionComponent<DownloadTabProps> = ({ download }) => {
  const { t } = useTranslation(["national-summary-data-page"]);

  return (
    <Section title={t("section_download.title")} description={t("section_download.description")}>
      <div className="w-full overflow-hidden max-w-screen-2xl">
        <NationalSummaryDataPageTable data={download} />
      </div>
    </Section>
  );
};

export default NationalSummaryDataPageDownload;
