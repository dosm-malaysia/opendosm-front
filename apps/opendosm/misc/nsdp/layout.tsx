import { AgencyBadge, Hero } from "datagovmy-ui/components";
import { AKSARA_COLOR } from "datagovmy-ui/constants";
import { clx } from "datagovmy-ui/helpers";
import { useTranslation } from "datagovmy-ui/hooks";
import { OptionType } from "datagovmy-ui/types";
import { FunctionComponent, ReactNode } from "react";
import { useRouter } from "next/router";

/**
 * National Summary Data Page Layout
 * @overview Status: Live
 */
interface NationalSummaryDataPageLayoutProps {
  children: (tab_index: string, chartColor: [string, string]) => ReactNode;
}

const NationalSummaryDataPageLayout: FunctionComponent<NationalSummaryDataPageLayoutProps> = ({
  children,
}) => {
  const { t } = useTranslation(["nsdp"]);
  const router = useRouter();

  const TAB_OPTIONS: Array<OptionType> = [
    {
      label: t("keys.download"),
      value: "download",
    },
    {
      label: t("keys.real"),
      value: "real",
    },
    {
      label: t("keys.fiscal"),
      value: "fiscal",
    },
    {
      label: t("keys.financial"),
      value: "financial",
    },
    {
      label: t("keys.external"),
      value: "external",
    },
    {
      label: t("keys.socio"),
      value: "socio",
    },
    // {
    //   label: t("keys.arc"),
    //   value: "arc",
    // },
  ];

  const tab_index = (router.query.tab as string) || "download";

  const getHeroBackgroundColor = (tab_index: string) => {
    switch (tab_index) {
      case "fiscal":
        return "red";
      case "financial":
        return "gray";
      case "external":
        return "green";

      default:
        return "blue";
    }
  };
  const getCategoryTextColor = (tab_index: string) => {
    switch (tab_index) {
      case "fiscal":
        return "text-danger";
      case "financial":
        return "text-black dark:text-white";
      case "external":
        return "text-[#16A34A]";

      default:
        return "text-primary dark:text-primary-dark";
    }
  };

  const getChartColor = (tab_index: string): [string, string] => {
    switch (tab_index) {
      case "fiscal":
        return [AKSARA_COLOR.DANGER, AKSARA_COLOR.DANGER_H];
      case "financial":
        return [AKSARA_COLOR.GREY, AKSARA_COLOR.GREY_H];
      case "external":
        return [AKSARA_COLOR.GREEN, AKSARA_COLOR.GREEN_H];

      default:
        return [AKSARA_COLOR.PRIMARY, AKSARA_COLOR.PRIMARY_H];
    }
  };

  const handleTabClick = (value: string) => {
    router.push({ query: { ...router.query, tab: value } }, undefined, { shallow: true });
  };

  return (
    <>
      <Hero
        background={getHeroBackgroundColor(tab_index)}
        category={[t("common:categories.summary"), getCategoryTextColor(tab_index)]}
        header={[t("header")]}
        description={[t("description")]}
      />
      <nav className="sticky top-0 z-20 flex overflow-hidden border-b border-b-outline bg-white dark:border-b-washed-dark dark:bg-black min-[350px]:justify-center">
        <div className="hide-scrollbar max-[420px]:justify-center, flex snap-x snap-mandatory scroll-px-9 flex-nowrap overflow-x-auto max-sm:justify-start">
          {TAB_OPTIONS.map(tab => (
            <div key={tab.value} className="snap-start">
              <div
                className="flex h-full min-w-[56px] cursor-pointer items-center justify-center px-3 outline-none"
                onClick={() => handleTabClick(tab.value)}
              >
                <div className="relative flex h-full flex-col items-center justify-center px-2 py-4">
                  <div
                    className={clx(
                      "flex items-center gap-2",
                      tab_index === tab.value ? "text-black dark:text-white" : "text-dim"
                    )}
                  >
                    <span className="whitespace-nowrap text-base font-medium">{tab.label}</span>
                  </div>
                  {tab_index === tab.value && (
                    <div className="absolute bottom-0 inline-flex h-[2px] w-full min-w-[56px] rounded-full bg-primary dark:bg-primary-dark" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>

      {children(tab_index, getChartColor(tab_index))}
    </>
  );
};

export default NationalSummaryDataPageLayout;
