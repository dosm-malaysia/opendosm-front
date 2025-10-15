import { Button, Section, Sidebar } from "datagovmy-ui/components";
import { BREAKPOINTS } from "datagovmy-ui/constants";
import { SliderProvider } from "datagovmy-ui/contexts/slider";
import { WindowContext } from "datagovmy-ui/contexts/window";
import { clx } from "datagovmy-ui/helpers";
import { useTranslation } from "datagovmy-ui/hooks";
import { WithData } from "datagovmy-ui/types";
import { Fragment, FunctionComponent, useContext, useRef } from "react";
import NSDPTimeseriesSection from "./ts-section";

type ArcTabProps = {
  arc: Record<string, WithData<Record<string, Record<string, number[]>>> & { x_freq: string }>;
  chartColor: [string, string];
};

const NSDPArc: FunctionComponent<ArcTabProps> = ({ arc, chartColor }) => {
  const { t } = useTranslation(["nsdp"]);
  const scrollRef = useRef<Record<string, HTMLElement | null>>({});
  const { size } = useContext(WindowContext);
  const data = Object.entries(arc) || [];

  return (
    <Sidebar
      sidebarTitle={t("on_this_page")}
      reverse={"pt-6"}
      categories={data.map(category => [category[0], []])}
      onSelect={selected =>
        scrollRef.current[selected]?.scrollIntoView({
          behavior: "smooth",
          block: size.width <= BREAKPOINTS.LG ? "start" : "start",
          inline: "start",
        })
      }
      sidebarClassName="top-28"
      mobileClassName="top-6"
      customList={(setSelected, onSelect, categories, selected) => {
        return (
          <>
            {categories.map(([category], index) => (
              <li key={`${category}`} title={category}>
                <Button
                  className={clx(
                    "px-4 lg:px-5 py-2 w-full rounded-none text-start leading-tight",
                    selected === category && "bg-bg-primary-50 text-txt-primary"
                  )}
                  onClick={() => {
                    setSelected(`${category}`);
                    onSelect(`${category}`);
                  }}
                >
                  {t(`section_arc.${category}.title`)}
                </Button>
              </li>
            ))}
          </>
        );
      }}
    >
      {size.width < BREAKPOINTS.LG && <div className="pt-12" />}
      {data.map(([section, dt]) => (
        <Fragment key={section}>
          <SliderProvider>
            {play => (
              <Section
                title={t(`section_arc.${section}.title`)}
                date={dt.data_as_of}
                ref={ref => {
                  scrollRef.current[section] = ref;
                }}
              >
                <NSDPTimeseriesSection
                  baseTranslation={`section_arc.${section}`}
                  datum={dt}
                  play={play}
                  chartColor={chartColor}
                  chartData={Object.keys(Object.values(dt.data)[0])
                    .filter(cd => cd !== "x" && cd !== "overall")
                    .map(cd => cd)}
                />
              </Section>
            )}
          </SliderProvider>
        </Fragment>
      ))}
    </Sidebar>
  );
};

export default NSDPArc;
