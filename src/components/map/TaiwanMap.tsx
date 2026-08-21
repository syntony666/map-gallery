import { useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import type { LatLngExpression, Layer, LeafletMouseEvent } from "leaflet";
import taiwanCounties from "../../data/twcounty.json";
import pins from "../../data/pins.json";
import districts from "../../data/districts.json";
import { DistrictPopup, type DistrictPopupData } from "./DistrictPopup";
import { DistrictHoverLabel } from "./DistrictHoverLabel";
import type { Photo } from "../../types/photo.type";

type Pin = {
  id: string;
  lat: number;
  lng: number;
  iconType?: string;
};

type DistrictContent = {
  id: string;
  districtName?: string;
  coverImage?: string;
  description?: string;
  photos: Photo[];
};

const taiwanCenter: LatLngExpression = [23.7, 121];

const taiwanBounds: [[number, number], [number, number]] = [
  [21.5, 118.0],
  [27.0, 124.0],
];

function getDistrictContent(id: string): DistrictContent | undefined {
  return districts.find((district) => district.id === id);
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

export function TaiwanMap() {
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

  function handleDistrictHover(id: string, hoverPosition?: [number, number]) {
    if (selectedDistrictId === id) return;

    setHoveredDistrictId(id);

    if (hoverPosition) {
      setHoveredPosition(hoverPosition);
    }
  }
  function handleDistrictLeave(id: string) {
    setHoveredDistrictId((current) => (current === id ? null : current));
    setHoveredPosition(null);
  }

  function handleDistrictClick(id: string, popupPosition?: [number, number]) {
    setSelectedDistrictId(id);

    if (popupPosition) {
      setSelectedPopupPosition(popupPosition);
    }
    setHoveredPosition(null);
  }

  function getPolygonStyle(id: string) {
    const isSelected = selectedDistrictId === id;
    const isHovered = hoveredDistrictId === id;

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
    id: string | null,
  ): DistrictPopupData | null {
    if (!id) return null;

    const content = getDistrictContent(id);

    return {
      id: content?.id ?? selectedDistrictId ?? "查無行政區",
      coverImage: content?.coverImage,
      description: content?.description,
      photos: content?.photos ?? [],
    };
  }

  const selectedDistrict = getSelectedDistrictData(selectedDistrictId);

  function onEachFeature(feature: GeoJSON.Feature, layer: Layer) {
    const id = getFeatureDistrictId(feature);

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        handleDistrictHover(id, [e.latlng.lat, e.latlng.lng]);
      },
      mouseout: () => {
        handleDistrictLeave(id);
      },
      click: (e: LeafletMouseEvent) => {
        handleDistrictClick(id, [e.latlng.lat, e.latlng.lng]);
      },
    });
  }

  return (
    // 設定地圖基本資料
    <MapContainer
      center={taiwanCenter}
      zoom={7}
      minZoom={7}
      maxZoom={7}
      maxBounds={taiwanBounds}
      maxBoundsViscosity={1.0}
      keyboard={false}
      className="w-full h-full"
    >
      {/* 地圖圖檔 */}
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
      {/* 地圖自帶元件：錨點 */}
      {pins.map((pin: Pin) => (
        <Marker
          key={pin.id}
          opacity={0}
          position={[pin.lat, pin.lng]}
          eventHandlers={{
            mouseover: () => {
              handleDistrictHover(pin.id, [pin.lat, pin.lng]);
            },
            mouseout: () => {
              handleDistrictLeave(pin.id);
            },
            click: () => {
              handleDistrictClick(pin.id, [pin.lat, pin.lng]);
            },
          }}
        />
      ))}
      {/* 自製游標移入高亮 */}
      {hoveredDistrictId && hoveredPosition && (
        <DistrictHoverLabel
          districtName={hoveredDistrictId}
          position={hoveredPosition}
        />
      )}
      {/* 各縣市的顯示氣泡 */}
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
