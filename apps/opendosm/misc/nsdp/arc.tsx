import { Button, Section, Sidebar } from "datagovmy-ui/components";
import { BREAKPOINTS } from "datagovmy-ui/constants";
import { WindowContext } from "datagovmy-ui/contexts/window";
import { clx } from "datagovmy-ui/helpers";
import { useTranslation } from "datagovmy-ui/hooks";
import { DateTime } from "luxon";
import { FunctionComponent, useContext, useRef } from "react";

type ArcTabProps = {
  categories: [category: string, subcategory: string[]][];
};

const NSDPArc: FunctionComponent<ArcTabProps> = ({ categories }) => {
  const { t } = useTranslation(["nsdp"]);
  const scrollRef = useRef<Record<string, HTMLElement | null>>({});
  const { size } = useContext(WindowContext);

  return (
    <Sidebar
      sidebarTitle={t("on_this_page")}
      reverse={"pt-6"}
      categories={categories}
      onSelect={selected =>
        scrollRef.current[selected]?.scrollIntoView({
          behavior: "smooth",
          block: size.width <= BREAKPOINTS.LG ? "start" : "center",
          inline: "end",
        })
      }
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
                  {category}
                </Button>
              </li>
            ))}
          </>
        );
      }}
    >
      {size.width < BREAKPOINTS.LG && <div className="pt-12" />}
      <Section
        title={t("section_arc.title")}
        description={t("section_arc.description")}
        date={DateTime.now().toSQL()}
        ref={ref => {
          scrollRef.current[categories[0][0]] = ref;
        }}
      ></Section>
      <Section
        title={t("section_arc.title")}
        description={t("section_arc.description")}
        ref={ref => {
          scrollRef.current[categories[1][0]] = ref;
        }}
      ></Section>
      <Section
        title={t("section_arc.title")}
        description={t("section_arc.description")}
        ref={ref => {
          scrollRef.current[categories[2][0]] = ref;
        }}
      ></Section>
    </Sidebar>
  );
};

export default NSDPArc;
