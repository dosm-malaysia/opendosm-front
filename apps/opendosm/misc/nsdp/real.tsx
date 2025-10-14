import { Section } from "datagovmy-ui/components";
import { useTranslation } from "datagovmy-ui/hooks";
import { FunctionComponent } from "react";

type RealTabProps = {};

const NSDPReal: FunctionComponent<RealTabProps> = ({}) => {
  const { t } = useTranslation(["nsdp"]);

  return (
    <Section title={t("section_real.title")} description={t("section_real.description")}></Section>
  );
};

export default NSDPReal;
