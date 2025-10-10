import { useTranslation } from "datagovmy-ui/hooks";
import { FunctionComponent } from "react";

const NationalSummaryDataPageDownload: FunctionComponent = ({}) => {
  const { t } = useTranslation(["gui-opendosm-pub", "catalogue", "publications"]);

  return <div>this is download tab</div>;
};

export default NationalSummaryDataPageDownload;
