import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { TableConfig } from "datagovmy-ui/charts/table";
import { Button, Container, Input, Panel, Section, Tabs, Tooltip } from "datagovmy-ui/components";
import { BREAKPOINTS } from "datagovmy-ui/constants";
import { WindowContext } from "datagovmy-ui/contexts/window";
import { clx, toDate } from "datagovmy-ui/helpers";
import { useData, useTranslation } from "datagovmy-ui/hooks";
import chunk from "lodash/chunk";
import { DateTime } from "luxon";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { FunctionComponent, useContext, useEffect, useMemo, useRef } from "react";

/**
 * Upcoming Publications
 * @overview Status: Live
 */

const Table = dynamic(() => import("datagovmy-ui/charts/table"), {
  ssr: false,
});

export type UpcomingPublication = {
  id: string;
  title: string;
  date: string;
  series: string;
};

interface UpcomingPublicationsProps {
  list_pubs: UpcomingPublication[];
}

type ScheduledPub = {
  day: number;
  month: number;
  date: string;
  data: UpcomingPublication[];
};

interface UpcomingQueryParams extends ParsedUrlQuery {
  search: string;
  page: string;
}

const UpcomingPublicationsDashboard: FunctionComponent<UpcomingPublicationsProps> = ({
  list_pubs,
}) => {
  const { t, i18n } = useTranslation(["publications", "common"]);
  const desktopRef = useRef<Record<string, HTMLElement | null>>({});
  const mobileRef = useRef<Record<string, HTMLElement | null>>({});
  const { query: _query, replace, ...router } = useRouter();
  const { size } = useContext(WindowContext);

  const ITEMS_PER_PAGE = 15;

  const today = DateTime.now().startOf("day");
  const thisMonth = today.month - 1; // 0 - 11
  const thisYear = today.year;

  const todayISO = DateTime.now().startOf("day").toISODate();
  const daysInWeek: string[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  const { data, setData } = useData({
    scrollToToday: false,
    tab_index: 0,
    month: thisMonth,
    year: thisYear,
  });

  const query = _query as UpcomingQueryParams;

  const queryState = useMemo(() => {
    if (!router.isReady) return null;

    return {
      search: query.search ?? "",
      page: query.page ?? "1",
    };
  }, [router.isReady, _query]);

  const updateQuery = (updates?: Record<string, any>) => {
    const nextQuery = updates ? { ...query, ...updates } : {};

    Object.keys(nextQuery).forEach(key => {
      if (nextQuery[key] === undefined || nextQuery[key] === null || nextQuery[key] === "") {
        delete nextQuery[key];
      }
    });

    replace(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  // for table data
  const filteredUpcomingTable = useMemo(() => {
    if (!router.isReady) {
      return { data: [], total: 0 };
    }
    const upc = list_pubs.filter(
      publication => DateTime.fromISO(publication.date).startOf("day") >= today
    );
    const search = queryState.search.toLowerCase();
    const searchFiltered = queryState.search
      ? upc.filter(publication => publication.title.toLowerCase().includes(search))
      : upc;

    const page = parseInt(queryState.page) || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginated = searchFiltered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return {
      data: paginated,
      total: searchFiltered.length,
    };
  }, [queryState?.search, queryState?.page, list_pubs]);

  const calendar = useMemo(() => {
    const monthDate = DateTime.local(data.year, data.month + 1);
    const startOfMonth = monthDate.startOf("month");
    const endOfMonth = monthDate.endOf("month");

    const gridStart = startOfMonth.minus({
      days: startOfMonth.weekday - 1,
    });

    const toCalendarDay = (dt: DateTime): ScheduledPub => ({
      day: dt.day,
      month: dt.month - 1,
      date: dt.toISODate(),
      data: list_pubs.filter(publication => publication.date === dt.toISODate()),
    });

    const desktop: ScheduledPub[] = Array.from({ length: 42 }, (_, i) =>
      toCalendarDay(gridStart.plus({ days: i }))
    );

    const mobile: ScheduledPub[] = Array.from({ length: endOfMonth.day }, (_, i) =>
      toCalendarDay(startOfMonth.plus({ days: i }))
    );

    return { desktop: chunk(desktop, 7), mobile };
  }, [data.month, data.year, list_pubs]);

  const config: TableConfig[] = [
    {
      accessorKey: "title",
      id: "title",
      header: t("table.title"),
      enableSorting: false,
      className: "max-sm:max-w-[300px]",
    },
    {
      accessorKey: "date",
      id: "release_date",
      header: t("table.release_date"),
      enableSorting: false,
      cell: ({ getValue }) => {
        return <>{toDate(getValue(), "dd MMM yyyy", i18n.language)}</>;
      },
    },
  ];

  const scrollToToday = () => {
    const scrollOptions: ScrollIntoViewOptions = {
      behavior: "smooth",
      block: "center",
    };
    if (size.width >= BREAKPOINTS.LG) desktopRef.current[todayISO]?.scrollIntoView(scrollOptions);
    else mobileRef.current[todayISO]?.scrollIntoView(scrollOptions);
  };

  useEffect(() => {
    if (data.scrollToToday)
      setTimeout(() => {
        if (data.month === thisMonth && data.year === thisYear) {
          scrollToToday();
          setData("scrollToToday", false);
        }
      }, 500);
  }, [data.scrollToToday]);

  if (!queryState) return null;

  return (
    <Container className="min-h-screen">
      <Section>
        <Tabs
          className="pb-8"
          title={<h4>{t("upcoming_publications")}</h4>}
          onChange={(index: number) => {
            if (data.tab_index === 1 && (queryState.search || +queryState.page > 1)) {
              updateQuery({ page: undefined, search: "" });
            }
            setData("tab_index", index);
          }}
          current={data.tab_index}
        >
          <Panel name={t("calendar_view")} key={"calendar_view"}>
            <div className="flex items-center justify-between gap-1.5 pb-3 max-lg:flex-col">
              <h5>
                {new Date(data.year, data.month).toLocaleString(i18n.language, {
                  month: "long",
                  year: "numeric",
                })}
              </h5>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="default"
                  className="btn-disabled"
                  onClick={() => {
                    setData("month", data.month - 1);
                    if (data.month === 0) {
                      setData("month", 11);
                      setData("year", data.year - 1);
                    }
                  }}
                  disabled={data.year === thisYear && data.month === thisMonth}
                >
                  <ChevronLeftIcon className="h-4.5 w-4.5" />
                </Button>
                <Button
                  variant="primary"
                  className="shadow-button"
                  onClick={() => {
                    if (data.month !== thisMonth) {
                      setData("scrollToToday", true);
                    } else {
                      scrollToToday();
                    }
                    setData("month", thisMonth);
                    setData("year", thisYear);
                  }}
                >
                  {t("today")}
                </Button>
                <Button
                  variant="default"
                  className="btn-disabled"
                  onClick={() => {
                    setData("month", data.month + 1);
                    if (data.month === 11) {
                      setData("month", 0);
                      setData("year", data.year + 1);
                    }
                  }}
                  disabled={data.year === thisYear + 1 && data.month === 11}
                >
                  <ChevronRightIcon className="h-4.5 w-4.5" />
                </Button>
              </div>
            </div>
            {
              <>
                <div className="hidden w-full rounded-lg border dark:border-washed-dark lg:flex">
                  <table className="w-full table-fixed divide-y dark:divide-washed-dark">
                    <thead>
                      <tr className="divide-x divide-outline dark:divide-washed-dark">
                        {daysInWeek.map(day => {
                          return (
                            <th
                              key={day}
                              className="select-none px-3 py-2 font-normal text-black dark:text-white"
                            >
                              {t(`${day}`)}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-washed-dark">
                      {calendar.desktop.map((week, i) => (
                        <tr key={i} className="divide-x divide-outline dark:divide-washed-dark">
                          {week.map(d => {
                            const isToday = DateTime.fromISO(d.date).hasSame(DateTime.now(), "day");
                            const notThisMonth = d.month !== data.month;

                            return (
                              <td
                                key={d.date}
                                ref={ref => {
                                  if (isToday) {
                                    desktopRef.current[d.date] = ref;
                                  }
                                }}
                                className={clx(
                                  "relative h-max min-h-[128px] min-w-[150px] px-3 pb-2 pt-[38px] align-top",
                                  notThisMonth && "bg-background dark:bg-black",
                                  isToday && "bg-primary/5"
                                )}
                              >
                                <div className="flex h-full flex-col justify-start">
                                  <div className="absolute left-3 top-2 text-primary dark:text-primary-dark">
                                    {isToday && t("today")}
                                  </div>
                                  <span
                                    className={clx(
                                      "absolute right-3 top-2",
                                      notThisMonth ? "text-dim" : "text-black dark:text-white",
                                      isToday &&
                                        "h-6 rounded-full bg-primary px-2 text-white dark:bg-primary-dark"
                                    )}
                                  >
                                    {d.day}{" "}
                                    {d.day === 1 &&
                                      new Date(data.year, d.month).toLocaleString(i18n.language, {
                                        month: "short",
                                      })}
                                  </span>

                                  <div className="flex h-full flex-col justify-start gap-1.5">
                                    {d.data.map((pub, i) => (
                                      <Tooltip
                                        key={`desktop_${pub.title}_${d.date}_${i}`}
                                        tip={pub.title}
                                      >
                                        {() => (
                                          <p className="h-6 w-full truncate rounded bg-primary/20 px-1.5 py-1 text-xs text-black dark:text-white">
                                            {pub.title}
                                          </p>
                                        )}
                                      </Tooltip>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-1 gap-3 md:max-lg:grid-cols-2 lg:hidden">
                  {calendar.mobile.map(d => {
                    const isToday = DateTime.fromISO(d.date).hasSame(DateTime.now(), "day");

                    if (!d.data.length) return;
                    return (
                      <div
                        key={d.date}
                        ref={ref => {
                          if (isToday) {
                            mobileRef.current[d.date] = ref;
                          }
                        }}
                        className={clx(
                          "flex min-h-[32px] min-w-[150px] flex-col rounded-xl border border-outline px-3 py-2 dark:border-washed-dark",
                          isToday && "bg-primary/5"
                        )}
                      >
                        <div className="flex h-full flex-col justify-start gap-1.5">
                          <div className="relative flex items-center justify-between">
                            <div className="text-primary dark:text-primary-dark">
                              {isToday && t("today")}
                            </div>
                            <span
                              className={clx(
                                "text-black dark:text-white",
                                isToday &&
                                  "absolute right-0 top-0 h-6 rounded-full bg-primary px-2 text-white dark:bg-primary-dark"
                              )}
                            >
                              {d.day}
                            </span>
                          </div>
                          {d.data.map((pub, i) => (
                            <Tooltip tip={pub.title} key={`mobile_${pub.title}_${d.date}_${i}`}>
                              {open => (
                                <div
                                  className="h-6 w-full cursor-help truncate rounded bg-primary/20 px-1.5 py-1 text-xs text-black dark:text-white"
                                  onClick={open}
                                >
                                  {pub.title}
                                </div>
                              )}
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            }
          </Panel>
          <Panel name={t("list_view")} key={"list_view"}>
            <div className="relative mx-auto my-6 w-full select-none overflow-hidden rounded-full border border-outline shadow-button hover:border-outlineHover focus:outline-none focus-visible:ring-0 dark:border-washed-dark dark:hover:border-outlineHover-dark sm:w-[500px]">
              <Input
                className="w-full truncate border-none bg-white py-3 pl-12 pr-10 text-base focus:outline-none focus:ring-0 dark:bg-black hover:dark:bg-washed-dark/50 focus:dark:bg-washed-dark"
                placeholder={t("search_publication")}
                value={queryState.search}
                onChange={e => {
                  updateQuery({ search: e, page: undefined });
                }}
              />
              <span className="absolute left-4 top-3.5">
                <MagnifyingGlassIcon className="h-5 w-5 text-black dark:text-dim" />
              </span>
            </div>
            {filteredUpcomingTable.data.length === 0 ? (
              <p className="flex h-[300px] w-full items-center justify-center text-dim">
                {t("common:common.no_entries")}.
              </p>
            ) : (
              <Table className="" data={filteredUpcomingTable.data} config={config} />
            )}

            {filteredUpcomingTable.total > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-4 pt-8 text-sm font-medium">
                <Button
                  variant="default"
                  className="btn-disabled"
                  onClick={() => {
                    updateQuery({
                      ...(+queryState.page - 1 > 1
                        ? { page: `${+queryState.page - 1}` }
                        : { page: undefined }),
                    });
                  }}
                  disabled={queryState.page === "1"}
                >
                  <ChevronLeftIcon className="h-4.5 w-4.5" />
                  {t("common:common.previous")}
                </Button>

                <span className="flex items-center gap-1 text-center">
                  {t("common:common.page_of", {
                    current: queryState.page,
                    total: Math.ceil(filteredUpcomingTable.total / ITEMS_PER_PAGE),
                  })}
                </span>
                <Button
                  variant="default"
                  className="btn-disabled"
                  onClick={() => {
                    updateQuery({ page: `${+queryState.page + 1}` });
                  }}
                  disabled={
                    queryState.page === `${Math.ceil(filteredUpcomingTable.total / ITEMS_PER_PAGE)}`
                  }
                >
                  {t("common:common.next")}
                  <ChevronRightIcon className="h-4.5 w-4.5" />
                </Button>
              </div>
            )}
          </Panel>
        </Tabs>
      </Section>
    </Container>
  );
};

export default UpcomingPublicationsDashboard;
