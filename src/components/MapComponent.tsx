import { useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import type { LatLngExpression, Layer, LeafletMouseEvent } from "leaflet";
import taiwanCounties from "../data/twcounty.json";
import pins from "../data/pins.json";
import districts from "../data/districts.json";
import { DistrictPopup, type DistrictPopupData } from "./DistrictPopup";
import { HoverLabel } from "./HoverLabel";

type Pin = {
  districtId: string;
  lat: number;
  lng: number;
  iconType?: string;
};

type Item = {
  id: string;
  title: string;
  thumbnail?: string;
  image: string;
  summary?: string;
  description?: string;
};

type DistrictContent = {
  districtId: string;
  districtName?: string;
  coverImage?: string;
  description?: string;
  items: Item[];
};

const taiwanCenter: LatLngExpression = [23.7, 121];

const taiwanBounds: [[number, number], [number, number]] = [
  [21.5, 118.0],
  [27.0, 124.0],
];

function getDistrictContent(districtId: string): DistrictContent | undefined {
  return districts.find((district) => district.districtId === districtId);
}

function getFeatureDistrictId(feature: GeoJSON.Feature | undefined): string {
  return (
    feature?.properties?.name ||
    feature?.properties?.NAME_2010 ||
    feature?.properties?.COUNTYNAME ||
    feature?.properties?.C_Name ||
    feature?.properties?.county ||
    ""
  );
}

export function MapComponent() {
  const [hoveredDistrictId, setHoveredDistrictId] = useState<string | null>(
    null,
  );
  const [hoveredPosition, setHoveredPosition] = useState<
    [number, number] | null
  >(null);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(
    null,
  );
  const [selectedPopupPosition, setSelectedPopupPosition] = useState<
    [number, number] | null
  >(null);

  function handleDistrictHover(
    districtId: string,
    hoverPosition?: [number, number],
  ) {
    if (selectedDistrictId === districtId) return;

    setHoveredDistrictId(districtId);

    if (hoverPosition) {
      setHoveredPosition(hoverPosition);
    }
  }
  function handleDistrictLeave(districtId: string) {
    setHoveredDistrictId((current) =>
      current === districtId ? null : current,
    );
    setHoveredPosition(null);
  }

  function handleDistrictClick(
    districtId: string,
    popupPosition?: [number, number],
  ) {
    setSelectedDistrictId(districtId);

    if (popupPosition) {
      setSelectedPopupPosition(popupPosition);
    }
    setHoveredPosition(null);
  }

  function getPolygonStyle(districtId: string) {
    const isSelected = selectedDistrictId === districtId;
    const isHovered = hoveredDistrictId === districtId;

    if (isSelected) {
      return {
        color: "#ffffff",
        weight: 2.5,
        fillColor: "#4fbfc0",
        fillOpacity: 0.55,
      };
    }

    if (isHovered) {
      return {
        color: "#ffffff",
        weight: 2,
        fillColor: "#4fbfc0",
        fillOpacity: 0.3,
      };
    }

    return {
      color: "#ffffff",
      weight: 1,
      fillColor: "#8fd3d1",
      fillOpacity: 0.18,
    };
  }

  const geoJsonKey = useMemo(() => {
    return `${hoveredDistrictId ?? "none"}-${selectedDistrictId ?? "none"}`;
  }, [hoveredDistrictId, selectedDistrictId]);

  function getSelectedDistrictData(
    districtId: string | null,
  ): DistrictPopupData | null {
    if (!districtId) return null;

    const content = getDistrictContent(districtId);

    return {
      districtId: content?.districtId ?? selectedDistrictId ?? "查無行政區",
      coverImage: content?.coverImage,
      description: content?.description,
      items: content?.items ?? [],
    };
  }

  const selectedDistrict = getSelectedDistrictData(selectedDistrictId);

  function onEachFeature(feature: GeoJSON.Feature, layer: Layer) {
    const districtId = getFeatureDistrictId(feature);

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        handleDistrictHover(districtId, [e.latlng.lat, e.latlng.lng]);
      },
      mouseout: () => {
        handleDistrictLeave(districtId);
      },
      click: (e: LeafletMouseEvent) => {
        handleDistrictClick(districtId, [e.latlng.lat, e.latlng.lng]);
      },
    });
  }

  return (
    <MapContainer
      center={taiwanCenter}
      zoom={8}
      minZoom={7}
      maxZoom={9}
      maxBounds={taiwanBounds}
      maxBoundsViscosity={1.0}
      keyboard={false}
      className="w-full h-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />

      <GeoJSON
        key={geoJsonKey}
        data={taiwanCounties as GeoJSON.GeoJsonObject}
        style={(feature) => getPolygonStyle(getFeatureDistrictId(feature))}
        onEachFeature={onEachFeature}
      />

      {pins.map((pin: Pin) => (
        <Marker
          key={pin.districtId}
          opacity={0}
          position={[pin.lat, pin.lng]}
          eventHandlers={{
            mouseover: () => {
              handleDistrictHover(pin.districtId, [pin.lat, pin.lng]);
            },
            mouseout: () => {
              handleDistrictLeave(pin.districtId);
            },
            click: () => {
              handleDistrictClick(pin.districtId, [pin.lat, pin.lng]);
            },
          }}
        />
      ))}

      {hoveredDistrictId && hoveredPosition && (
        <HoverLabel
          districtName={hoveredDistrictId}
          position={hoveredPosition}
        />
      )}

      {selectedPopupPosition && (
        <Popup
          position={selectedPopupPosition}
          eventHandlers={{
            remove: () => {
              setSelectedDistrictId(null);
              setSelectedPopupPosition(null);
            },
          }}
        >
          <DistrictPopup district={selectedDistrict} />
        </Popup>
      )}
    </MapContainer>
  );
}
