import {
  Column,
  createColumnHelper,
  useReactTable,
  flexRender,
  getCoreRowModel,
} from "@tanstack/react-table";
import { FunctionComponent, useMemo } from "react";
import { DownloadItem } from "./download";
import { useTranslation } from "datagovmy-ui/hooks";

declare module "@tanstack/table-core" {
  // @ts-expect-error
  interface ColumnMeta<TData extends RowData, TValue> {
    rowSpan?: number;
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
      }),
      columnHelper.accessor("as_of", {
        id: "as_of",
        header: t("table.as_of"),
      }),
      columnHelper.accessor("last_updated", {
        id: "last_updated",
        header: t("table.last_updated"),
      }),
      columnHelper.accessor("next_update", {
        id: "next_update",
        header: t("table.next_update"),
      }),
      columnHelper.group({
        header: "SDMX",
        columns: [
          columnHelper.accessor("sdmx_xml", {
            id: "sdmx_xml",
            header: t("table.sdmx_xml"),
          }),
          columnHelper.accessor("sdmx_json", {
            id: "sdmx_json",
            header: t("table.sdmx_json"),
          }),
          columnHelper.accessor("sdmx_csv", {
            id: "sdmx_csv",
            header: t("table.sdmx_csv"),
          }),
          columnHelper.accessor("sdmx_parquet", {
            id: "sdmx_parquet",
            header: t("table.sdmx_parquet"),
          }),
        ],
      }),
      columnHelper.display({
        id: "sdmx_excel",
        header: t("table.sdmx_excel"),
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
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse border border-outline dark:border-washed-dark">
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
                      className="border border-outline dark:border-washed-dark p-3 text-left text-xs leading-[18px] font-medium text-dim dark:text-white"
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
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="border border-outline dark:border-washed-dark px-4 py-2"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NationalSummaryDataPageTable;
