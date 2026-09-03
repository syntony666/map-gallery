import { useState, useEffect } from "react";
import { useMap } from "react-leaflet";

type HoverLabelProps = {
  districtName: string;
  position: [number, number];
};

export function DistrictHoverLabel({
  districtName,
  position,
}: HoverLabelProps) {
  const map = useMap();
  const [point, setPoint] = useState(() =>
    map.latLngToContainerPoint(position),
  );

  useEffect(() => {
    function updatePoint() {
      setPoint(map.latLngToContainerPoint(position));
    }

    updatePoint();

    map.on("move zoom resize", updatePoint);

    return () => {
      map.off("move zoom resize", updatePoint);
    };
  }, [map, position]);

  return (
    <div
      className="map-hover-label"
      style={{
        left: `${point.x}px`,
        top: `${point.y}px`,
      }}
    >
      {districtName}
    </div>
  );
}
