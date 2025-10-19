import { Periods } from "datagovmy-ui/charts/timeseries";
import { Dropdown, Slider } from "datagovmy-ui/components";
import { numFormat, toDate } from "datagovmy-ui/helpers";
import { useData, useSlice, useTranslation } from "datagovmy-ui/hooks";
import { OptionType, WithData } from "datagovmy-ui/types";
import dynamic from "next/dynamic";
import { FC, useCallback } from "react";

const Timeseries = dynamic(() => import("datagovmy-ui/charts/timeseries"), {
  ssr: false,
});

interface TimeseriesSectionProps {
  datum: WithData<Record<string, Record<string, number[]>>> & { x_freq: string };
  play: boolean;
  chartColor: [borderColor: string, backgroundColor: string];
  chartData: string[];
  baseTranslation: string;
}

interface TimeseriesChartData {
  title: string;
  unitY: string;
  label: string;
  data: number[];
  fill: boolean;
  callout: string;
  prefix?: string;
}

const NSDPTimeseriesSection: FC<TimeseriesSectionProps> = ({
  datum,
  play,
  chartColor,
  chartData,
  baseTranslation,
}) => {
  const { t, i18n } = useTranslation(["nsdp"]);

  const INDEX_OPTIONS: Array<OptionType> = Object.keys(datum.data).map((key: string) => ({
    label: t(`${baseTranslation}.keys.${key}`),
    value: key,
  }));

  const { data, setData } = useData({
    index_type: INDEX_OPTIONS[0],
    minmax: [0, datum.data[INDEX_OPTIONS[0].value].x.length - 1],
  });

  const LATEST_TIMESTAMP =
    datum.data[data.index_type.value].x[datum.data[data.index_type.value].x.length - 1];
  const { coordinate } = useSlice(datum.data[data.index_type.value], data.minmax);

  const configs = useCallback<(key: string) => { unit: string; callout: string; fill: boolean }>(
    (key: string) => {
      let unit = "";
      let calloutPrefix = "";
      let calloutValue = numFormat(
        datum.data[data.index_type.value][key][datum.data[data.index_type.value][key].length - 1],
        "standard",
        [1, 1]
      );
  
      if (/growth|perc/.test(data.index_type.value)) {
        unit = "%";
      } else if (data.index_type.value.includes("rm")) {
        calloutPrefix = "RM";
      }
  
      const callout = calloutPrefix + calloutValue + unit;
  
      return {
        unit,
        callout,
        fill: true,
      };
    },
    [data.index_type, data.shade_type]
  );

  const getChartData = (sectionHeaders: string[]): TimeseriesChartData[] =>
    sectionHeaders.map(chartName => ({
      title: t(`${baseTranslation}.keys.${chartName}`),
      unitY: configs(chartName).unit,
      label: t(`${baseTranslation}.keys.${chartName}`),
      data: coordinate[chartName],
      fill: configs(chartName).fill,
      callout: configs(chartName).callout,
    }));

  const gridChartData = getChartData(chartData);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-row">
        <Dropdown
          anchor="left"
          selected={data.index_type}
          options={INDEX_OPTIONS}
          onChange={(e: any) => setData("index_type", e)}
        />
      </div>

      {Object.values(datum.data)[0]["overall"] && (
        <>
          <Timeseries
            title={t(`${baseTranslation}.keys.overall`)}
            className="h-[300px] w-full"
            interval={datum.x_freq as Periods}
            enableAnimation={!play}
            unitY={configs("overall").unit}
            axisY={{
              y2: {
                display: false,
                grid: {
                  drawTicks: false,
                  drawBorder: false,
                  lineWidth: 0.5,
                },
                ticks: {
                  display: false,
                },
              },
            }}
            data={{
              labels: coordinate.x,
              datasets: [
                {
                  type: "line",
                  data: coordinate.overall,
                  label: t(`${baseTranslation}.keys.overall`),
                  borderColor: chartColor[0],
                  backgroundColor: chartColor[1],
                  borderWidth: 1.5,
                  fill: configs("overall").fill,
                },
              ],
            }}
            stats={[
              {
                title: t("common:common.latest", {
                  date: toDate(LATEST_TIMESTAMP, "MMM yyyy", i18n.language),
                }),
                value: configs("overall").callout,
              },
            ]}
          />

          <Slider
            className=""
            type="range"
            value={data.minmax}
            data={datum.data[data.index_type.value].x}
            period="month"
            onChange={e => setData("minmax", e)}
          />
        </>
      )}

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {gridChartData.map(chartData => (
          <Timeseries
            key={chartData.title}
            title={chartData.title}
            className="h-[300px] w-full"
            enableAnimation={!play}
            interval={datum.x_freq as Periods}
            unitY={chartData.unitY}
            axisY={{
              y2: {
                display: false,
                grid: {
                  drawTicks: false,
                  drawBorder: false,
                  lineWidth: 0.5,
                },
                ticks: {
                  display: false,
                },
              },
            }}
            data={{
              labels: coordinate.x,
              datasets: [
                {
                  type: "line",
                  label: chartData.label,
                  data: chartData.data,
                  borderColor: chartColor[0],
                  backgroundColor: chartColor[1],
                  fill: chartData.fill,
                  borderWidth: 1.5,
                },
              ],
            }}
            stats={[
              {
                title: t("common:common.latest", {
                  date: toDate(LATEST_TIMESTAMP, "MMM yyyy", i18n.language),
                }),
                value: chartData.callout,
              },
            ]}
            beginZero={false} // Don't force y-axis to start at 0
          />
        ))}
      </div>

      {!Object.values(datum.data)[0]["overall"] && (
        <>
          <Slider
            className=""
            type="range"
            value={data.minmax}
            data={datum.data[data.index_type.value].x}
            period="month"
            onChange={e => setData("minmax", e)}
          />
        </>
      )}
    </div>
  );
};

export default NSDPTimeseriesSection;
