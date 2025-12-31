import { BuildingLibraryIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/20/solid";
import {
  AgencyBadge,
  Button,
  Checkbox,
  Container,
  Daterange,
  Dropdown,
  Hero,
  Label,
  Modal,
  Radio,
  Search,
  Section,
  Sidebar,
} from "datagovmy-ui/components";
import { BREAKPOINTS } from "datagovmy-ui/constants";
import { WindowContext } from "datagovmy-ui/contexts/window";
import { useTranslation } from "datagovmy-ui/hooks";
import { Agency, OptionType, SiteName } from "datagovmy-ui/types";
import {
  FunctionComponent,
  useMemo,
  useRef,
  ForwardRefExoticComponent,
  forwardRef,
  useImperativeHandle,
  useContext,
  LegacyRef,
} from "react";
import CatalogueCard from "../Card";
import { Catalogue } from "../../../types/data-catalogue";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";

/**
 * Catalogue Index
 * @overview Status: Live
 */

interface CatalogueIndexProps {
  collection: Record<string, any>;
  sources: string[];
  site: SiteName;
}

const CatalogueIndex: FunctionComponent<CatalogueIndexProps> = ({ collection, sources, site }) => {
  const { t } = useTranslation(["catalogue", "common"]);
  const scrollRef = useRef<Record<string, HTMLElement | null>>({});
  const filterRef = useRef<CatalogueFilterRef>(null);
  const { size } = useContext(WindowContext);
  const sourceOptions = sources.map(source => ({
    label: t(`agencies:${source.toLowerCase()}.full`),
    value: source,
  }));
  const { query: _query, ...router } = useRouter();
  const query = _query as DCIndexQueryParams;

  const filteredCollection = useMemo(() => {
    if (!query) return collection;

    const search = query.search?.toLowerCase();

    const result: Record<string, Record<string, Catalogue[]>> = {};

    Object.entries(collection).forEach(([category, subcategories]) => {
      const filteredSubcategories: Record<string, Catalogue[]> = {};

      Object.entries(subcategories).forEach(([subcategoryTitle, datasets]) => {
        const filteredDatasets = (datasets as Catalogue[]).filter(d => {
          // ---- SEARCH ----
          const passesSearch =
            !search ||
            d.title.toLowerCase().includes(search) ||
            d.desc?.toLowerCase().includes(search);

          // ---- FREQUENCY ----
          const passesFrequency =
            !query.frequency || (d.freq && d.freq.toUpperCase() === query.frequency.toUpperCase());

          // ---- GEOGRAPHY ----
          const passesGeography =
            !query.geography ||
            query.geography.split(",").every(geo => Array.isArray(d.geo) && d.geo.includes(geo));

          // ---- DEMOGRAPHY ----
          const passesDemography =
            !query.demography ||
            query.demography
              .split(",")
              .every(demog => Array.isArray(d.demog) && d.demog.includes(demog));

          // ---- SOURCE ----
          const passesSource =
            !query.source || (Array.isArray(d.source) && d.source.includes(query.source));

          return (
            passesSearch && passesFrequency && passesGeography && passesDemography && passesSource
          );
        });

        if (filteredDatasets.length > 0) {
          filteredSubcategories[subcategoryTitle] = filteredDatasets;
        }
      });

      if (Object.keys(filteredSubcategories).length > 0) {
        result[category] = filteredSubcategories;
      }
    });

    return result;
  }, [
    collection,
    query?.search,
    query?.frequency,
    query?.geography,
    query?.demography,
    query?.source,
  ]);

  const _collection = useMemo<Array<[string, any]>>(() => {
    const resultCollection: Array<[string, Catalogue[]]> = [];
    Object.entries(filteredCollection).forEach(([category, subcategory]) => {
      Object.entries(subcategory).forEach(([subcategory_title, datasets]) => {
        resultCollection.push([`${category}: ${subcategory_title}`, datasets as Catalogue[]]);
      });
    });

    return resultCollection;
  }, [filteredCollection]);

  const getHeaderText = (
    site: SiteName
  ): { category: string; description: string; agency: Agency } => {
    switch (site) {
      case "datagovmy":
        return {
          category: t("header_category_govt"),
          description: t("description", {
            agency: query.source ? t(`agencies:${query.source.toLowerCase()}.full`) : "",
            context: query.source ? "agency" : "",
          }),
          agency: "govt",
        };
      case "opendosm":
        return {
          category: t("header_category_agency", {
            agency: t("agencies:dosm.abbr"),
          }),
          description: t("description_opendosm"),
          agency: "dosm",
        };
      case "kkmnow":
        return {
          category: t("header_category_agency", {
            agency: t("agencies:moh.abbr"),
          }),
          description: t("description", {
            agency: t("agencies:moh.full"),
            context: "agency",
          }),
          agency: "moh",
        };

      default:
        return {
          category: t("header_category_govt"),
          description: t("description", {
            agency: query.source ? t(`agencies:${query.source.toLowerCase()}.full`) : "",
            context: query.source ? "agency" : "",
          }),
          agency: "govt",
        };
    }
  };

  const text = getHeaderText(site);

  return (
    <>
      <Hero
        background="blue"
        category={[text.category, "text-primary dark:text-primary-dark"]}
        header={[`${query.source ? query.source.concat(":") : ""} ${t("header")}`]}
        description={[text.description]}
        action={
          sourceOptions.length > 0 && (
            <Dropdown
              icon={<BuildingLibraryIcon className="text-dim h-4 w-4" />}
              width="w-fit"
              placeholder={t("placeholder.source")}
              anchor="left"
              options={sourceOptions}
              selected={
                query.source
                  ? {
                      label: t(`agencies:${query.source.toLowerCase()}.full`),
                      value: query.source,
                    }
                  : undefined
              }
              onChange={e => filterRef.current?.updateQuery({ source: e.value })}
              enableSearch
              enableClear
            />
          )
        }
        agencyBadge={
          <AgencyBadge
            agency={query.source ? (query.source.toLowerCase() as Agency) : text.agency}
          />
        }
      />

      <Container className="min-h-screen lg:px-0 lg:pl-6">
        <Sidebar
          categories={Object.entries(filteredCollection).map(([category, subcategory]) => [
            category,
            Object.keys(subcategory),
          ])}
          onSelect={selected =>
            scrollRef.current[selected]?.scrollIntoView({
              behavior: "smooth",
              block: size.width <= BREAKPOINTS.LG ? "start" : "center",
              inline: "end",
            })
          }
        >
          <div className="flex flex-1 flex-col">
            <CatalogueFilter ref={filterRef} sources={sourceOptions} />

            {_collection.length > 0 ? (
              _collection.map(([title, datasets]) => {
                return (
                  <Section
                    title={title}
                    key={title}
                    ref={ref => {
                      scrollRef.current[title] = ref;
                    }}
                    className="p-2 py-6 first-of-type:max-lg:pb-6 first-of-type:max-lg:pt-14 lg:p-8"
                  >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {datasets.map((item: Catalogue, index: number) => (
                        <CatalogueCard key={index} dataset={item} index={index} />
                      ))}
                    </div>
                  </Section>
                );
              })
            ) : (
              <p className="text-dim p-2 pt-16 lg:p-8">{t("common:common.no_entries")}.</p>
            )}
          </div>
        </Sidebar>
      </Container>
    </>
  );
};

interface DCIndexQueryParams extends ParsedUrlQuery {
  demography: string;
  frequency: string;
  geography: string;
  source: string;
  search: string;
  begin: string;
  end: string;
}

const DEFAULTS = {
  search: "" as string,
  source: "" as string,
  frequency: "" as string,
  demography: [] as OptionType[],
  geography: [] as OptionType[],
  begin: "" as string,
  end: "" as string,
} as const;

/**
 * Catalogue Filter Component
 */
interface CatalogueFilterProps {
  sources: OptionType[];
  ref: LegacyRef<CatalogueFilterRef>;
}

interface CatalogueFilterRef {
  updateQuery: (updates?: Record<string, any> | undefined) => void;
}

const CatalogueFilter: ForwardRefExoticComponent<CatalogueFilterProps> = forwardRef(
  ({ sources }, ref) => {
    const { t } = useTranslation(["catalogue", "common"]);
    const { query: _query, replace, ...router } = useRouter();
    const query = _query as DCIndexQueryParams;

    const frequencies: OptionType[] = [
      { label: t("filter_options.daily"), value: "DAILY" },
      { label: t("filter_options.weekly"), value: "WEEKLY" },
      { label: t("filter_options.monthly"), value: "MONTHLY" },
      { label: t("filter_options.quarterly"), value: "QUARTERLY" },
      { label: t("filter_options.yearly"), value: "YEARLY" },
      { label: t("filter_options.intraday"), value: "INTRADAY" },
      { label: t("filter_options.infrequent"), value: "INFREQUENT" },
      { label: t("filter_options.as_required"), value: "AS_REQUIRED" },
    ];
    const geographies: OptionType[] = [
      { label: t("filter_options.national"), value: "NATIONAL" },
      { label: t("filter_options.state"), value: "STATE" },
      { label: t("filter_options.district"), value: "DISTRICT" },
      { label: t("filter_options.parlimen"), value: "PARLIMEN" },
      { label: t("filter_options.dun"), value: "DUN" },
    ];
    const demographies: OptionType[] = [
      { label: t("filter_options.sex"), value: "SEX" },
      { label: t("filter_options.ethnicity"), value: "ETHNICITY" },
      { label: t("filter_options.age"), value: "AGE" },
      { label: t("filter_options.religion"), value: "RELIGION" },
      { label: t("filter_options.nationality"), value: "NATIONALITY" },
      { label: t("filter_options.disability"), value: "DISABILITY" },
      { label: t("filter_options.marital"), value: "MARITAL" },
    ];

    const startYear = 1920;
    const endYear: number = new Date().getFullYear();

    const filterYears = (start: number, end: number): OptionType[] =>
      Array(end - start + 1)
        .fill(start)
        .map((year, index) => ({ label: `${year + index}`, value: `${year + index}` }));

    const queryState = useMemo(() => {
      if (!router.isReady) return null;

      return {
        search: query.search ?? DEFAULTS.search,
        source: query.source ?? DEFAULTS.source,
        frequency: query.frequency ?? DEFAULTS.frequency,
        demography: query.demography
          ? demographies.filter(item => query.demography.split(",").includes(item.value))
          : DEFAULTS.demography,
        geography: query.geography
          ? geographies.filter(item => query.geography.split(",").includes(item.value))
          : DEFAULTS.geography,
        begin: query.begin ?? DEFAULTS.begin,
        end: query.end ?? DEFAULTS.end,
      };
    }, [router.isReady, _query]);

    const updateQuery = (updates?: Record<string, any>) => {
      const nextQuery = (updates ? { ...query, ...updates } : {}) as typeof query;

      (Object.keys(nextQuery) as Array<keyof typeof nextQuery>).forEach(key => {
        const value = nextQuery[key];
        if (value === undefined || value === null || value === "") {
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

    const actives = useMemo<
      Array<[keyof typeof DEFAULTS, (typeof DEFAULTS)[keyof typeof DEFAULTS]]>
    >(() => {
      if (!router.isReady || !queryState) return [];

      return (
        Object.entries(queryState) as Array<
          [keyof typeof DEFAULTS, (typeof DEFAULTS)[keyof typeof DEFAULTS]]
        >
      ).filter(([_, value]) => {
        if (value === undefined || value === null) return false;
        if (value === "") return false;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      });
    }, [router.isReady, queryState]);

    const reset = () => {
      updateQuery();
    };

    useImperativeHandle(ref, () => {
      return { updateQuery };
    });

    if (!queryState) return null;

    return (
      <div className="dark:border-washed-dark sticky top-14 z-10 flex items-center justify-between gap-2 border-b bg-white py-3 lg:pl-2 dark:bg-black">
        <div className="flex-1">
          <Search
            className="border-none"
            placeholder={t("placeholder.search")}
            query={queryState.search}
            onChange={e => {
              updateQuery({ search: e });
            }}
          />
        </div>
        {actives.length > 0 && actives.findIndex(active => active[0] !== "source") !== -1 && (
          <Button
            variant="reset"
            className="hover:bg-washed dark:hover:bg-washed-dark text-dim group block rounded-full p-1 hover:text-black xl:hidden dark:hover:text-white"
            disabled={!actives.length}
            onClick={reset}
          >
            <XMarkIcon className="text-dim h-5 w-5 group-hover:text-black dark:group-hover:text-white" />
          </Button>
        )}
        {/* Mobile */}
        <div className="block xl:hidden">
          <Modal
            trigger={open => (
              <Button onClick={open} className="btn-default shadow-floating">
                <span>{t("filter")}</span>
                <span className="bg-primary dark:bg-primary-dark w-4.5 h-5 rounded-md text-center text-white">
                  {actives.length}
                </span>
                <ChevronDownIcon className="-mx-[5px] h-5 w-5" />
              </Button>
            )}
            title={<Label label={t("filter") + ":"} className="text-sm font-bold" />}
          >
            {close => (
              <div className="px-4.5 pb-4.5 dark:divide-washed-dark mb-[84px] flex h-max flex-col divide-y overflow-y-auto bg-white dark:bg-black">
                <div className="py-3">
                  <Radio
                    name="frequency"
                    label={t("frequency")}
                    options={frequencies}
                    value={frequencies.find(freq => freq.value === queryState.frequency)}
                    onChange={e => {
                      updateQuery({ frequency: e.value });
                    }}
                  />
                </div>
                <div className="py-3">
                  <Checkbox
                    name="geography"
                    label={t("geography")}
                    options={geographies}
                    value={queryState.geography}
                    onChange={e => {
                      updateQuery({ geography: e.map(item => item.value).join(",") });
                    }}
                  />
                </div>
                <div className="py-3">
                  <Checkbox
                    name="demography"
                    label={t("demography")}
                    options={demographies}
                    value={queryState.demography}
                    onChange={e => {
                      updateQuery({ demography: e.map(item => item.value).join(",") });
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <Dropdown
                    label={t("begin")}
                    width="w-full"
                    anchor="left-0 bottom-10"
                    options={filterYears(startYear, endYear)}
                    placeholder={t("common:common.select")}
                    selected={filterYears(startYear, endYear).find(
                      year => year.value === queryState.begin
                    )}
                    onChange={e => {
                      updateQuery({ begin: e.value });
                    }}
                  />
                  <Dropdown
                    label={t("end")}
                    width="w-full"
                    anchor="right-0 bottom-10"
                    disabled={!queryState.begin}
                    options={queryState.begin ? filterYears(+queryState.begin, endYear) : []}
                    placeholder={t("common:common.select")}
                    selected={filterYears(startYear, endYear).find(
                      year => year.value === queryState.end
                    )}
                    onChange={e => {
                      updateQuery({ end: e.value });
                    }}
                  />
                </div>
                <div className="dark:border-washed-dark fixed bottom-0 left-0 flex w-full flex-col border-t bg-white p-3 dark:bg-black">
                  <Button
                    variant="primary"
                    className="justify-center"
                    disabled={!actives.length}
                    onClick={reset}
                  >
                    {t("common:common.reset")}
                  </Button>
                  <Button variant="base" className="justify-center" onClick={close}>
                    {/* <XMarkIcon className="h-4 w-4" /> */}
                    {t("common:common.close")}
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>

        {/* Desktop */}
        <div className="hidden gap-2 pr-6 xl:flex">
          {actives.length > 0 && actives.findIndex(active => active[0] !== "source") !== -1 && (
            <Button
              className="btn-ghost text-dim group hover:text-black dark:hover:text-white"
              disabled={!actives.length}
              onClick={reset}
            >
              <XMarkIcon className="text-dim h-5 w-5 group-hover:text-black dark:group-hover:text-white" />
              {t("common:common.clear_all")}
            </Button>
          )}
          <Dropdown
            options={frequencies}
            placeholder={t("frequency")}
            selected={frequencies.find(e => e.value === queryState.frequency) ?? undefined}
            onChange={e => {
              updateQuery({ frequency: e.value });
            }}
          />
          <Dropdown
            multiple
            enableClear
            title={t("geography")}
            options={geographies}
            selected={queryState.geography}
            onChange={e => {
              updateQuery({ geography: e.map((item: OptionType) => item.value).join(",") });
            }}
          />
          <Dropdown
            multiple
            enableClear
            title={t("demography")}
            description={t("placeholder.demography") + ":"}
            options={demographies}
            selected={queryState.demography}
            onChange={e => {
              updateQuery({ demography: e.map((item: OptionType) => item.value).join(",") });
            }}
          />

          <Daterange
            startYear={startYear}
            endYear={endYear}
            selectedStart={query.begin}
            selectedEnd={query.end}
            onChange={([begin, end]) => {
              if (begin) updateQuery({ begin: begin });
              if (end) updateQuery({ end: end });
            }}
            onReset={() => {
              updateQuery({ begin: "", end: "" });
            }}
          />
        </div>
      </div>
    );
  }
);

CatalogueFilter.displayName = "CatalogueFilter";

export default CatalogueIndex;
