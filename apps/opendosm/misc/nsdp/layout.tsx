import { AgencyBadge, Hero } from "datagovmy-ui/components";
import { clx } from "datagovmy-ui/helpers";
import { useData, useTranslation } from "datagovmy-ui/hooks";
import { OptionType } from "datagovmy-ui/types";
import { FunctionComponent, ReactNode } from "react";

/**
 * National Summary Data Page Layout
 * @overview Status: Live
 */
interface NationalSummaryDataPageLayoutProps {
  children: (tab_index: string) => ReactNode;
}

const NationalSummaryDataPageLayout: FunctionComponent<NationalSummaryDataPageLayoutProps> = ({
  children,
}) => {
  const { t } = useTranslation(["nsdp"]);

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
    {
      label: t("keys.arc"),
      value: "arc",
    },
  ];

  const { data, setData } = useData({
    tab_index: TAB_OPTIONS[0].value,
  });

  return (
    <>
      <Hero
        background="blue"
        category={[t("common:categories.rate-statistics"), "text-primary dark:text-primary-dark"]}
        header={[t("header")]}
        description={[t("description")]}
        agencyBadge={<AgencyBadge agency="dosm" />}
      />

      <nav className="sticky top-14 z-20 flex overflow-hidden border-b border-b-outline bg-white dark:border-b-washed-dark dark:bg-black min-[350px]:justify-center lg:static">
        <div className="hide-scrollbar max-[420px]:justify-center, flex snap-x snap-mandatory scroll-px-9 flex-nowrap overflow-x-auto max-sm:justify-start">
          {TAB_OPTIONS.map(tab => (
            <div key={tab.value} className="snap-start">
              <div
                className="flex h-full min-w-[56px] cursor-pointer items-center justify-center px-3 outline-none"
                onClick={() => setData("tab_index", tab.value)}
              >
                <div className="relative flex h-full flex-col items-center justify-center px-2 py-4">
                  <div
                    className={clx(
                      "flex items-center gap-2",
                      data.tab_index === tab.value ? "text-black dark:text-white" : "text-dim"
                    )}
                  >
                    <span className="whitespace-nowrap text-base font-medium">{tab.label}</span>
                  </div>
                  {data.tab_index === tab.value && (
                    <div className="absolute bottom-0 inline-flex h-[2px] w-full min-w-[56px] rounded-full bg-primary dark:bg-primary-dark" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>

      {children(data.tab_index)}
    </>
  );
};

export default NationalSummaryDataPageLayout;
