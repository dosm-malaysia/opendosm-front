import {
  createColumnHelper,
  useReactTable,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";
import { FunctionComponent, useMemo } from "react";
import { DownloadItem } from "./download";
import { useTranslation } from "datagovmy-ui/hooks";
import { At, Button, TooltipAlt, TooltipContent, TooltipTrigger } from "datagovmy-ui/components";
import { ArrowDownTrayIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { clx, download, toDate } from "datagovmy-ui/helpers";
import { ExcelIcon } from "datagovmy-ui/icons";

declare module "@tanstack/table-core" {
  // @ts-expect-error
  interface ColumnMeta<TData extends RowData, TValue> {
    cellClass?: string;
    headerClass?: string;
  }
}

interface NationalSummaryDataPageTableProps {
  data: DownloadItem[];
}

const NationalSummaryDataPageTable: FunctionComponent<NationalSummaryDataPageTableProps> = ({
  data = [],
}) => {
  const { t } = useTranslation(["national-summary-data-page"]);

  const columnHelper = createColumnHelper<DownloadItem>();

  const tableCols = useMemo(
    () => [
      columnHelper.accessor("title", {
        id: "title",
        header: t("table.title"),
        cell: ({ getValue, row }) => (
          <At
            className="text-primary hover:underline"
            external={true}
            href={row.original.title_link}
          >
            {getValue()}
          </At>
        ),
      }),
      columnHelper.accessor("as_of", {
        id: "as_of",
        header: t("table.as_of"),
        cell: ({ getValue }) => toDate(getValue()),
      }),
      columnHelper.accessor("last_updated", {
        id: "last_updated",
        header: t("table.last_updated"),
        cell: ({ getValue }) => toDate(getValue(), "dd MMM yyyy, HH:mm"),
      }),
      columnHelper.accessor("next_update", {
        id: "next_update",
        header: t("table.next_update"),
        cell: ({ getValue }) => toDate(getValue(), "dd MMM yyyy, HH:mm"),
      }),
      columnHelper.group({
        header: "table.sdmx",
        meta: {
          headerClass: "text-center",
        },
        columns: [
          columnHelper.accessor("sdmx_xml", {
            id: "sdmx_xml",
            header: t("table.sdmx_xml"),
            meta: {
              headerClass: "text-center",
            },
            cell: ({ getValue, row }) => (
              <Button
                className="text-primary dark:text-primary-dark border-otl-primary-200 px-2.5"
                variant="default"
                icon={<ArrowDownTrayIcon className="size-4" />}
                onClick={() => download(getValue(), row.original.title)}
              >
                <span className="flex-1">SDMX-XML</span>
              </Button>
            ),
          }),
          columnHelper.accessor("sdmx_json", {
            id: "sdmx_json",
            header: t("table.sdmx_json"),
            meta: {
              headerClass: "text-center",
              cellClass: "w-fit",
            },
            cell: ({ getValue, row }) => (
              <Button
                className="text-primary dark:text-primary-dark border-otl-primary-200 px-2.5"
                variant="default"
                icon={<ArrowDownTrayIcon className="size-4" />}
                onClick={() => download(getValue(), row.original.title)}
              >
                <span className="flex-1">SDMX-JSON</span>
              </Button>
            ),
          }),
          columnHelper.accessor("sdmx_csv", {
            id: "sdmx_csv",
            header: t("table.sdmx_csv"),
            meta: {
              headerClass: "text-center",
            },
            cell: ({ getValue, row }) => (
              <Button
                className="text-primary dark:text-primary-dark border-otl-primary-200 px-2.5"
                variant="default"
                icon={<ArrowDownTrayIcon className="size-4" />}
                onClick={() => download(getValue(), row.original.title)}
              >
                <span className="flex-1">SDMX-CSV</span>
              </Button>
            ),
          }),
          columnHelper.accessor("sdmx_parquet", {
            id: "sdmx_parquet",
            header: () => (
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
            ),
            meta: {
              headerClass: "text-center",
            },
            cell: ({ getValue, row }) => (
              <Button
                className="text-[#FFA100] dark:text-[#FFA100] hover:border-[#FFA100]/60 border-[#FFE1AD] px-2.5"
                variant="default"
                icon={<ArrowDownTrayIcon className="size-4" />}
                onClick={() => download(getValue(), row.original.title)}
              >
                <span className="flex-1">SDMX-Parquet</span>
              </Button>
            ),
          }),
        ],
      }),
      columnHelper.accessor("sdmx_excel", {
        id: "sdmx_excel",
        header: t("table.sdmx_excel"),
        meta: {
          headerClass: "text-center",
        },
        cell: ({ getValue, row }) => (
          <Button
            className="text-primary dark:text-primary-dark border-otl-primary-200 px-2.5"
            variant="default"
            icon={<ExcelIcon className="size-4" />}
            onClick={() => download(getValue(), row.original.title)}
          >
            <span className="flex-1">XLSX</span>
          </Button>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns: tableCols,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-scroll max-w-full">
      <table className="min-w-full w-full table-auto border-collapse border border-otl-gray-200">
        <thead>
          {table.getHeaderGroups().map(headerGroup => {
            return (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const columnRelativeDepth = header.depth - header.column.depth;
                  if (columnRelativeDepth > 1) {
                    return null;
                  }

                  let rowSpan = 1;
                  if (header.isPlaceholder) {
                    const leafs = header.getLeafHeaders();
                    rowSpan = leafs[leafs.length - 1].depth - header.depth;
                  }

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      rowSpan={rowSpan}
                      className={clx(
                        "border border-otl-gray-200 p-3 text-left text-body-xs font-medium text-txt-black-500",
                        header.column.columnDef.meta?.headerClass
                      )}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => {
            if (row.original.category) {
              return (
                <tr key={`explanation-${index}`}>
                  <td
                    colSpan={9}
                    className="border-b border-otl-gray-200 bg-bg-washed p-3 text-center text-body-sm italic"
                  >
                    {row.original.category}
                  </td>
                </tr>
              );
            }

            return (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <td
                      key={cell.id}
                      className={clx(
                        "border-y border-otl-gray-200 p-1.5 text-body-sm font-medium text-txt-black-900",
                        cell.column.columnDef.meta?.cellClass
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NationalSummaryDataPageTable;
