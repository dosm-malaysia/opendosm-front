import {
  PublicationModal,
  PublicationCard,
  PubResource,
  Publication,
} from "datagovmy-ui/components";
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { routes } from "@lib/routes";
import { Button, Container, Input, Section } from "datagovmy-ui/components";
import { useData, useTranslation } from "datagovmy-ui/hooks";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState, useContext, useMemo } from "react";
import { DateTime } from "luxon";
import { AnalyticsContext } from "datagovmy-ui/contexts/analytics";
import { ParsedUrlQuery } from "querystring";

/**
 * Technical Notes
 * @overview Status: Live
 */

interface PublicationQueryParams extends ParsedUrlQuery {
  page: string;
  search: string;
}

interface TechnicalNotesProps {
  params: any;
  pub: PubResource | null;
  publications: Publication[];
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

const DEFAULTS = {
  search: "" as string,
  page: "1" as string,
} as const;

const TechnicalNotesDashboard: FunctionComponent<TechnicalNotesProps> = ({
  pub,
  publications,
  params,
  setTrigger,
}) => {
  const { send_new_analytics } = useContext(AnalyticsContext);
  const { t } = useTranslation(["publications", "common"]);
  const { push, events, query: _query, replace, ...router } = useRouter();
  const [show, setShow] = useState<boolean>(false);
  const ITEMS_PER_PAGE = 15;
  const { data, setData } = useData({
    loading: false,
    modal_loading: false,
  });

  const query = _query as PublicationQueryParams;

  const queryState = useMemo(() => {
    if (!router.isReady) return null;

    return {
      search: query.search ?? DEFAULTS.search,
      page: query.page ?? DEFAULTS.page,
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

  const filteredPublications = useMemo(() => {
    if (!router.isReady) {
      return { data: [], total: 0 };
    }
    const search = queryState.search.toLowerCase();
    const searchFiltered = queryState.search
      ? publications.filter(
          publication =>
            publication.title.toLowerCase().includes(search) ||
            publication.desc.toLowerCase().includes(search)
        )
      : publications;

    const page = parseInt(queryState.page) || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginated = searchFiltered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return {
      data: paginated,
      total: searchFiltered.length,
    };
  }, [queryState, publications]);

  const postDownload = async (resource_id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TINYBIRD_URL}/events?name=dgmy_pub_dls`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TINYBIRD_TOKEN}`,
          },
          body: JSON.stringify({
            publication_id: params.pub_id,
            resource_id: resource_id,
            timestamp: DateTime.now().toSQL({ includeOffset: false }),
          }),
        }
      );

      if (response.ok) {
        setTrigger(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    show ? (document.body.style.overflow = "hidden") : (document.body.style.overflow = "unset");
  }, [show]);

  useEffect(() => {
    if (pub) {
      setShow(true);
    }
    events.on("routeChangeComplete", () => {
      setData("modal_loading", false);
    });
    return () => {
      events.off("routeChangeComplete", () => {
        setData("modal_loading", false);
      });
    };
  }, [pub]);

  if (!queryState) return null;

  return (
    <Container className="min-h-screen">
      <Section>
        <h4 className="text-center">{t("technical_notes")}</h4>
        <div className="relative mx-auto mb-12 mt-6 w-full select-none overflow-hidden rounded-full border border-outline shadow-button hover:border-outlineHover focus:outline-none focus-visible:ring-0 dark:border-washed-dark dark:hover:border-outlineHover-dark sm:w-[500px]">
          <Input
            className="w-full truncate border-none bg-white py-3 pl-12 pr-10 text-base focus:outline-none focus:ring-0 dark:bg-black hover:dark:bg-washed-dark/50 focus:dark:bg-washed-dark"
            placeholder={t("search_publication")}
            value={queryState.search}
            onChange={e => {
              updateQuery({ page: undefined, search: e });
            }}
          />
          <span className="absolute left-4 top-3.5">
            <MagnifyingGlassIcon className="h-5 w-5 text-black dark:text-dim" />
          </span>
          {queryState.search && (
            <span
              className="absolute right-4 top-3.5 group rounded-full cursor-pointer"
              onClick={e => {
                updateQuery({ page: undefined, search: "" });
              }}
            >
              <XMarkIcon className="text-black dark:text-dim size-5 group-hover:bg-washed group-hover:dark:bg-washed-dark" />
            </span>
          )}
        </div>

        {filteredPublications.data.length === 0 ? (
          <p className="flex h-[300px] w-full items-center justify-center text-dim">
            {t("common:common.no_entries")}.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPublications.data.map((item: Publication) => (
              <PublicationCard
                key={item.id}
                publication={item}
                sendAnalytics={send_new_analytics}
                onClick={() => {
                  setData("modal_loading", true);
                  setShow(true);
                  push(
                    {
                      pathname: `${routes.PUBLICATIONS_TECHNOTES}/${item.id}`,
                      query: query,
                    },
                    routes.PUBLICATIONS_TECHNOTES.concat("/", item.id),
                    {
                      scroll: false,
                    }
                  );
                }}
              />
            ))}
          </div>
        )}

        <PublicationModal
          type={"/technical-notes/"}
          pub_id={params.pub_id}
          post={resource_id => postDownload(resource_id)}
          publication={pub}
          loading={data.modal_loading}
          show={show}
          hide={() => {
            setShow(false);
            push(
              {
                pathname: router.pathname,
                query: {
                  ...query,
                  pub_id: undefined,
                },
              },
              undefined,
              {
                scroll: false,
              }
            );
          }}
        />

        {filteredPublications.total > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-4 pt-8 text-sm font-medium">
            <Button
              variant="default"
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
                total: Math.ceil(filteredPublications.total / ITEMS_PER_PAGE),
              })}
            </span>
            <Button
              variant="default"
              onClick={() => {
                updateQuery({ page: `${+queryState.page + 1}` });
              }}
              disabled={
                queryState.page === `${Math.ceil(filteredPublications.total / ITEMS_PER_PAGE)}`
              }
            >
              {t("common:common.next")}
              <ChevronRightIcon className="h-4.5 w-4.5" />
            </Button>
          </div>
        )}
      </Section>
    </Container>
  );
};

export default TechnicalNotesDashboard;
