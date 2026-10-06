import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet";
import type { LatLngExpression, Layer, LeafletMouseEvent } from "leaflet";
import taiwanCounties from "../../data/twcounty.json";
import pins from "../../data/pins.json";
import { galleryStore } from "../../stores/gallery.store";
import type { Area } from "../../types/gallery.type";
import { AreaPopup, type AreaPopupData } from "./AreaPopup";
import { AreaHoverLabel } from "./AreaHoverLabel";

type Pin = {
  id: string;
  lat: number;
  lng: number;
  iconType?: string;
};

const taiwanCenter: LatLngExpression = [23.7, 121];

const taiwanBounds: [[number, number], [number, number]] = [
  [21.5, 118.0],
  [27.0, 124.0],
];

function getFeatureAreaId(feature: GeoJSON.Feature | undefined): string {
  return feature?.properties?.county || "";
}

export function TaiwanMap() {
  const [sourceAreas, setSourceAreas] = useState<Area[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [hoveredAreaId, setHoveredAreaId] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<
    [number, number] | null
  >(null);

  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedPopupPosition, setSelectedPopupPosition] = useState<
    [number, number] | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    galleryStore
      .getAreas()
      .then((areas) => {
        if (cancelled) {
          return;
        }

        setSourceAreas(areas);
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }

        setError(
          reason instanceof Error ? reason.message : "無法載入行政區資料",
        );
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const areaByName = useMemo(() => {
    return new Map<string, Area>(
      sourceAreas?.map((area) => [area.name, area]) ?? [],
    );
  }, [sourceAreas]);

  function handleAreaHover(id: string, hoverPosition?: [number, number]) {
    if (selectedAreaId === id) {
      return;
    }

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
    if (!id) {
      return null;
    }

    return areaByName.get(id) ?? null;
  }

  const selectedArea = getSelectedAreaData(selectedAreaId);

  function onEachFeature(feature: GeoJSON.Feature, layer: Layer) {
    const id = getFeatureAreaId(feature);

    layer.on({
      mouseover: (event: LeafletMouseEvent) => {
        handleAreaHover(id, [event.latlng.lat, event.latlng.lng]);
      },
      mouseout: () => {
        handleAreaLeave(id);
      },
      click: (event: LeafletMouseEvent) => {
        handleAreaClick(id, [event.latlng.lat, event.latlng.lng]);
      },
    });
  }

  return (
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

      {hoveredAreaId && hoveredPosition && (
        <AreaHoverLabel areaName={hoveredAreaId} position={hoveredPosition} />
      )}

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

      {error && (
        <div className="pointer-events-none absolute left-4 top-4 z-[1000] rounded bg-white px-3 py-2 text-sm text-red-600 shadow">
          {error}
        </div>
      )}
    </MapContainer>
  );
}
