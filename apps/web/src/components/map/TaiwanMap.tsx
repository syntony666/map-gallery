import { useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import type { LatLngExpression, Layer, LeafletMouseEvent } from "leaflet";
import taiwanCounties from "../../data/twcounty.json";
import pins from "../../data/pins.json";
import areas from "../../data/districts.json";
import { AreaPopup, type AreaPopupData } from "./AreaPopup";
import { AreaHoverLabel } from "./AreaHoverLabel";
import type { Photo } from "../../types/gallery.type";

type Pin = {
  id: string;
  lat: number;
  lng: number;
  iconType?: string;
};

type AreaContent = {
  id: string;
  areaName?: string;
  coverImage?: string;
  description?: string;
  photos: Photo[];
};

const taiwanCenter: LatLngExpression = [23.7, 121];

const taiwanBounds: [[number, number], [number, number]] = [
  [21.5, 118.0],
  [27.0, 124.0],
];

function getAreaContent(id: string) {
  return areas.find((area) => area.id === id) as AreaContent | undefined;
}

function getFeatureAreaId(feature: GeoJSON.Feature | undefined): string {
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
  const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<
    [number, number] | null
  >(null);

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedPopupPosition, setSelectedPopupPosition] = useState<
    [number, number] | null
  >(null);

  function handleAreaHover(id: string, hoverPosition?: [number, number]) {
    if (selectedAreaId === id) return;

    setHoveredAreaId(id);

    if (hoverPosition) {
      setHoveredPosition(hoverPosition);
    }
  }
  function handleAreaLeave(id: string) {
    setHoveredAreaId((current) => (current === id ? null : current));
    setHoveredPosition(null);
  }

  function handleAreaClick(id: string, popupPosition?: [number, number]) {
    setSelectedAreaId(id);

    if (popupPosition) {
      setSelectedPopupPosition(popupPosition);
    }
    setHoveredPosition(null);
  }

  function getPolygonStyle(id: string) {
    const isSelected = selectedAreaId === id;
    const isHovered = hoveredAreaId === id;

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
    return `${hoveredAreaId ?? "none"}-${selectedAreaId ?? "none"}`;
  }, [hoveredAreaId, selectedAreaId]);

  function getSelectedAreaData(id: string | null): AreaPopupData | null {
    if (!id) return null;

    const content = getAreaContent(id);

    return {
      id: content?.id ?? selectedAreaId ?? "查無行政區",
      coverImage: content?.coverImage,
      description: content?.description,
      photos: content?.photos ?? [],
    };
  }

  const selectedArea = getSelectedAreaData(selectedAreaId);

  function onEachFeature(feature: GeoJSON.Feature, layer: Layer) {
    const id = getFeatureAreaId(feature);

    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        handleAreaHover(id, [e.latlng.lat, e.latlng.lng]);
      },
      mouseout: () => {
        handleAreaLeave(id);
      },
      click: (e: LeafletMouseEvent) => {
        handleAreaClick(id, [e.latlng.lat, e.latlng.lng]);
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
        style={(feature) => getPolygonStyle(getFeatureAreaId(feature))}
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
              handleAreaHover(pin.id, [pin.lat, pin.lng]);
            },
            mouseout: () => {
              handleAreaLeave(pin.id);
            },
            click: () => {
              handleAreaClick(pin.id, [pin.lat, pin.lng]);
            },
          }}
        />
      ))}
      {/* 自製游標移入高亮 */}
      {hoveredAreaId && hoveredPosition && (
        <AreaHoverLabel areaName={hoveredAreaId} position={hoveredPosition} />
      )}
      {/* 各縣市的顯示氣泡 */}
      {selectedPopupPosition && (
        <Popup
          position={selectedPopupPosition}
          eventHandlers={{
            remove: () => {
              setSelectedAreaId(null);
              setSelectedPopupPosition(null);
            },
          }}
        >
          <AreaPopup area={selectedArea} />
        </Popup>
      )}
    </MapContainer>
  );
}
