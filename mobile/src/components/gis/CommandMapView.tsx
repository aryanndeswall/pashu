import React, { useState, useEffect, useMemo } from 'react';
import { Radio, MapPin } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import Map, { Source, Layer, Marker, Popup, ViewState } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import { getApiUrl } from '../../config/api';

export interface VillagePin {
  id: string;
  name: string;
  nameMr: string;
  bovineCount: number;
  cases: number;
  longitude: number;
  latitude: number;
  zone: 'INFECTED' | 'RING_VAC' | 'SURVEILLANCE';
}

export interface ActiveCluster {
  id: string;
  syndrome_code: string;
  primary_disease: string;
  centroid_lat: number;
  centroid_lon: number;
  cases_count: number;
  containment_radius_km: number;
  containment_zones?: {
    infected_zone_radius_km: number;
    surveillance_zone_radius_km: number;
    buffer_zone_radius_km: number;
  };
  district?: string;
  taluka?: string;
}

export const CommandMapView: React.FC = () => {
  const { currentLanguage, t } = useLanguageStore();
  const [showBuffers, setShowBuffers] = useState(true);
  const [showVillages, setShowVillages] = useState(true);
  const [selectedVillage, setSelectedVillage] = useState<VillagePin | null>(null);
  const [clusters, setClusters] = useState<ActiveCluster[]>([]);
  const [, setIsLoading] = useState(true);

  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: 74.64,
    latitude: 19.38,
    zoom: 9.5,
    pitch: 0,
    bearing: 0,
  });

  useEffect(() => {
    let active = true;
    async function loadClusters() {
      try {
        const res = await fetch(getApiUrl('clusters/active'));
        if (res.ok) {
          const data = await res.json();
          if (active && Array.isArray(data)) {
            setClusters(data);
            if (data.length > 0 && data[0].centroid_lon && data[0].centroid_lat) {
              setViewState((prev) => ({
                ...prev,
                longitude: data[0].centroid_lon,
                latitude: data[0].centroid_lat,
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load active clusters for map:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadClusters();
    return () => {
      active = false;
    };
  }, []);

  // Generate true geodetic buffers using Turf.js only for real clusters
  const bufferGeoJSON = useMemo(() => {
    if (clusters.length === 0) {
      return { type: 'FeatureCollection', features: [] };
    }
    const features: any[] = [];
    clusters.forEach((cluster) => {
      const lon = cluster.centroid_lon || 74.64;
      const lat = cluster.centroid_lat || 19.38;
      const center = turf.point([lon, lat]);
      const rad10 = cluster.containment_zones?.buffer_zone_radius_km || 10;
      const rad5 = cluster.containment_zones?.surveillance_zone_radius_km || 5;
      const rad1 = cluster.containment_zones?.infected_zone_radius_km || 1;

      features.push({ ...turf.buffer(center, rad10, { units: 'kilometers' }), properties: { type: '10km' } });
      features.push({ ...turf.buffer(center, rad5, { units: 'kilometers' }), properties: { type: '5km' } });
      features.push({ ...turf.buffer(center, rad1, { units: 'kilometers' }), properties: { type: '1km' } });
    });

    return { type: 'FeatureCollection', features };
  }, [clusters]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
      {/* Header & Layer Toggles */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            <Radio className="w-4 h-4 animate-pulse text-rose-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white lang-devanagari flex items-center gap-1.5">
              <span>
                {currentLanguage === 'en'
                  ? 'Web-GIS Outbreak Cluster Map'
                  : currentLanguage === 'hi'
                  ? 'स्थानिक प्रकोप मानचित्र (Web-GIS Map)'
                  : 'स्थानिक वेब-जीआयएस नकाशा (Web-GIS Outbreak Map)'}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  clusters.length > 0
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {clusters.length > 0
                  ? `${clusters.length} ACTIVE CLUSTER`
                  : currentLanguage === 'en'
                  ? 'NO ACTIVE OUTBREAKS'
                  : 'प्रादुर्भाव नाही'}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold">
          <button
            onClick={() => setShowBuffers(!showBuffers)}
            className={`px-2 py-1 rounded-lg border transition-colors ${
              showBuffers
                ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                : 'text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {t('bufferToggle', 'बफर')}
          </button>
          <button
            onClick={() => setShowVillages(!showVillages)}
            className={`px-2 py-1 rounded-lg border transition-colors ${
              showVillages
                ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
                : 'text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {t('villagesToggle', 'गावे')}
          </button>
        </div>
      </div>

      {/* Outbreak Status Notice */}
      {clusters.length === 0 && (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse" />
          <span>
            {currentLanguage === 'en'
              ? 'Zero active outbreak containment zones detected. District veterinary surveillance normal.'
              : 'सध्या कार्यक्षेत्रात कोणताही संसर्गजन्य रोग प्रादुर्भाव किंवा कंटेनमेंट झोन नाही.'}
          </span>
        </div>
      )}

      {/* MapLibre GL JS Vector Map Canvas */}
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        <Map
          {...viewState}
          onMove={(evt: any) => setViewState(evt.viewState)}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          attributionControl={false}
        >
          {/* Turf Buffer Layers */}
          {showBuffers && bufferGeoJSON.features.length > 0 && (
            <Source type="geojson" data={bufferGeoJSON as any}>
              <Layer
                id="10km-buffer"
                type="fill"
                filter={['==', 'type', '10km']}
                paint={{ 'fill-color': '#06b6d4', 'fill-opacity': 0.12 }}
              />
              <Layer
                id="10km-stroke"
                type="line"
                filter={['==', 'type', '10km']}
                paint={{ 'line-color': '#06b6d4', 'line-width': 1, 'line-dasharray': [2, 2] }}
              />

              <Layer
                id="5km-buffer"
                type="fill"
                filter={['==', 'type', '5km']}
                paint={{ 'fill-color': '#f59e0b', 'fill-opacity': 0.18 }}
              />
              <Layer
                id="5km-stroke"
                type="line"
                filter={['==', 'type', '5km']}
                paint={{ 'line-color': '#f59e0b', 'line-width': 1, 'line-dasharray': [3, 3] }}
              />

              <Layer
                id="1km-buffer"
                type="fill"
                filter={['==', 'type', '1km']}
                paint={{ 'fill-color': '#dc2626', 'fill-opacity': 0.32 }}
              />
              <Layer
                id="1km-stroke"
                type="line"
                filter={['==', 'type', '1km']}
                paint={{ 'line-color': '#dc2626', 'line-width': 1.5 }}
              />
            </Source>
          )}

          {/* Active Cluster Center Markers */}
          {clusters.map((c) => (
            <Marker
              key={c.id}
              longitude={c.centroid_lon || 74.64}
              latitude={c.centroid_lat || 19.38}
              anchor="bottom"
            >
              <div className="cursor-pointer group flex flex-col items-center">
                <div className="p-1.5 rounded-full shadow-lg border-2 bg-rose-600 border-white animate-bounce">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded shadow mt-0.5">
                  {c.primary_disease || c.syndrome_code}
                </span>
              </div>
            </Marker>
          ))}

          {/* Popup */}
          {selectedVillage && (
            <Popup
              longitude={selectedVillage.longitude}
              latitude={selectedVillage.latitude}
              anchor="top"
              closeButton={true}
              closeOnClick={false}
              onClose={() => setSelectedVillage(null)}
              className="z-50"
            >
              <div className="p-2 text-slate-800">
                <h4 className="font-bold text-sm mb-1">{selectedVillage.name}</h4>
                <div className="text-xs text-slate-500 mb-1">{selectedVillage.nameMr}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-rose-600">{selectedVillage.cases} Cases</span>
                  <span className="text-slate-400">•</span>
                  <span>{selectedVillage.bovineCount} Bovines</span>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};
