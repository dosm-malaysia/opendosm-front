import {
  Button,
  Label,
  Modal,
  Section,
  TooltipAlt,
  TooltipContent,
  TooltipTrigger,
} from "datagovmy-ui/components";
import { useTranslation } from "datagovmy-ui/hooks";
import { FunctionComponent } from "react";
import NationalSummaryDataPageTable from "./table";
import { ArrowDownTrayIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { toDate, download as downloadItem } from "datagovmy-ui/helpers";
import { ExcelIcon } from "datagovmy-ui/icons";

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
      <div className="w-full overflow-hidden max-w-screen-2xl hidden lg:block">
        <NationalSummaryDataPageTable data={download} />
      </div>
      <div className="lg:hidden w-full max-lg:max-w-[600px] max-lg:mx-auto">
        {download.map((list, index) => {
          if (list.category) {
            return (
              <div
                key={`explanation-${index}`}
                className="border-b border-otl-gray-200 bg-bg-washed p-3 text-center text-body-xs italic"
              >
                {list.category}
              </div>
            );
          }

          return (
            <div
              key={`row-${index}`}
              className="py-3 border-b border-otl-gray-200 flex justify-between gap-3 text-body-sm"
            >
              <div className="flex-1 space-y-3">
                <h5 className="text-body-sm text-primary dark:text-primary-dark font-medium mb-1.5">
                  {list.title}
                </h5>
                <div className="space-y-1.5">
                  <p className="text-body-xs text-txt-black-500 flex items-center gap-1.5 flex-wrap">
                    {t("table.as_of")}
                    <span className="text-txt-black-700">{toDate(list.as_of)}</span>
                  </p>
                  <p className="text-body-xs text-txt-black-500 flex items-center gap-1.5 flex-wrap">
                    {t("table.last_updated")}
                    <span className="text-txt-black-700">
                      {toDate(list.last_updated, "dd MMM yyyy, HH:mm")}
                    </span>
                  </p>
                  <p className="text-body-xs text-txt-black-500 flex items-center gap-1.5 flex-wrap">
                    {t("table.next_update")}
                    <span className="text-txt-black-700">
                      {toDate(list.next_update, "dd MMM yyyy, HH:mm")}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <Modal
                  trigger={open => (
                    <Button
                      onClick={open}
                      className="text-primary dark:text-primary-dark border-otl-primary-200 px-2.5 capitalize"
                      variant="default"
                      icon={<ArrowDownTrayIcon className="size-4" />}
                    >
                      {t("common:common.downloads_one")}
                    </Button>
                  )}
                  title={<Label label={list.title} className="text-body-lg font-semibold px-1.5" />}
                >
                  {close => (
                    <div className="flex h-max flex-col divide-y divide-otl-gray-200 overflow-y-auto bg-bg-white">
                      <div className="flex items-center justify-between py-4 text-body-sm px-4.5">
                        <p>{t("table.sdmx_xml")}</p>
                        <Button
                          className="text-primary dark:text-primary-dark border-otl-primary-200 px-2.5"
                          variant="default"
                          icon={<ArrowDownTrayIcon className="size-4" />}
                          onClick={() => downloadItem(list.sdmx_xml, list.title)}
                        >
                          <span className="flex-1">SDMX-XML</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-4 text-body-sm px-4.5">
                        <p>{t("table.sdmx_json")}</p>
                        <Button
                          className="text-primary dark:text-primary-dark border-otl-primary-200 px-2.5"
                          variant="default"
                          icon={<ArrowDownTrayIcon className="size-4" />}
                          onClick={() => downloadItem(list.sdmx_json, list.title)}
                        >
                          <span className="flex-1">SDMX-JSON</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-4 text-body-sm px-4.5">
                        <p>{t("table.sdmx_csv")}</p>
                        <Button
                          className="text-primary dark:text-primary-dark border-otl-primary-200 px-2.5"
                          variant="default"
                          icon={<ArrowDownTrayIcon className="size-4" />}
                          onClick={() => downloadItem(list.sdmx_csv, list.title)}
                        >
                          <span className="flex-1">SDMX-CSV</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-4 text-body-sm px-4.5">
                        <div className="flex items-center gap-3 justify-center">
                          {t("table.sdmx_parquet")}
                          <TooltipAlt>
                            <TooltipTrigger>
                              <QuestionMarkCircleIcon className="size-4 text-txt-black-500" />
                            </TooltipTrigger>
                            <TooltipContent className="text-txt-white text-body-xs">
                              {t("table.sdmx_parquet_tooltip")}
                            </TooltipContent>
                          </TooltipAlt>
                        </div>
                        <Button
                          className="text-[#FFA100] dark:text-[#FFA100] hover:border-[#FFA100]/60 border-[#FFE1AD] px-2.5"
                          variant="default"
                          icon={<ArrowDownTrayIcon className="size-4" />}
                          onClick={() => downloadItem(list.sdmx_parquet, list.title)}
                        >
                          <span className="flex-1">SDMX-Parquet</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between py-4 text-body-sm px-4.5">
                        <p>{t("table.sdmx_excel")}</p>
                        <Button
                          className="text-primary dark:text-primary-dark border-otl-primary-200 px-2.5"
                          variant="default"
                          icon={<ExcelIcon className="size-4" />}
                          onClick={() => downloadItem(list.sdmx_excel, list.title)}
                        >
                          <span className="flex-1">XLSX</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </Modal>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default NationalSummaryDataPageDownload;
