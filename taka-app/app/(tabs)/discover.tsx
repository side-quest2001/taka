import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { api } from '../../services/api';
import { COLORS, INDORE_CENTER } from '../../constants';
import { BusinessProfile, InfluencerProfile } from '../../types';

type DiscoveryMarker = {
    id: string;
    type: 'influencer' | 'business';
    lat: number;
    lng: number;
    title: string;
    subtitle: string;
    detail: string;
};

export default function DiscoverScreen() {
    const router = useRouter();
    const [influencers, setInfluencers] = useState<InfluencerProfile[]>([]);
    const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
    const [filter, setFilter] = useState<'all' | 'influencer' | 'business'>('all');
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setError('');
            const [infData, bizData] = await Promise.all([
                api.getInfluencers(),
                api.getBusinesses(),
            ]);
            setInfluencers(infData);
            setBusinesses(bizData);
        } catch (error) {
            console.error('Failed to load data:', error);
            setError('Could not load discovery data. Check that the backend is running on port 3000.');
        }
    };

    const formatFollowers = (count: number) => {
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    const visibleInfluencers = filter === 'all' || filter === 'influencer' ? influencers : [];
    const visibleBusinesses = filter === 'all' || filter === 'business' ? businesses : [];

    const mapMarkers: DiscoveryMarker[] = useMemo(() => [
        ...visibleInfluencers.map((inf) => ({
            id: inf.id,
            type: 'influencer' as const,
            lat: inf.latitude,
            lng: inf.longitude,
            title: inf.name,
            subtitle: inf.niches,
            detail: `${formatFollowers(inf.followerCount)} followers`,
        })),
        ...visibleBusinesses.map((biz) => ({
            id: biz.id,
            type: 'business' as const,
            lat: biz.latitude,
            lng: biz.longitude,
            title: biz.businessName,
            subtitle: biz.category,
            detail: biz.address,
        })),
    ], [visibleInfluencers, visibleBusinesses]);

    const markerCount = mapMarkers.length;
    const mapHtml = useMemo(() => createLeafletMapHtml(mapMarkers), [mapMarkers]);

    const handleMapMessage = (rawMessage: string) => {
        try {
            const message = JSON.parse(rawMessage);
            if (message?.type === 'influencer' && message?.id) {
                router.push(`/search/influencer/${message.id}`);
            }
        } catch (error) {
            console.warn('Ignored map message:', error);
        }
    };

    const renderMap = () => (
        <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
                <View>
                    <Text style={styles.mapTitle}>Indore Discovery Map</Text>
                    <Text style={styles.mapSubtitle}>{markerCount} live demo pins</Text>
                </View>
                <View style={styles.mapLegend}>
                    {(filter === 'all' || filter === 'influencer') && (
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.influencerDot]} />
                            <Text style={styles.legendText}>Influencers</Text>
                        </View>
                    )}
                    {(filter === 'all' || filter === 'business') && (
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.businessDot]} />
                            <Text style={styles.legendText}>Businesses</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.mapShell}>
                <WebView
                    source={{ html: mapHtml }}
                    style={styles.map}
                    originWhitelist={['*']}
                    javaScriptEnabled
                    domStorageEnabled
                    mixedContentMode="always"
                    scrollEnabled={false}
                    nestedScrollEnabled
                    onMessage={(event) => handleMapMessage(event.nativeEvent.data)}
                    renderError={() => (
                        <View style={styles.mapFallback}>
                            <MaterialCommunityIcons name="alert-circle" size={28} color={COLORS.error} />
                            <Text style={styles.mapFallbackText}>Map could not load. Check mobile internet.</Text>
                        </View>
                    )}
                />
            </View>
        </View>
    );

    const renderInfluencerCard = (inf: InfluencerProfile) => (
        <TouchableOpacity
            key={inf.id}
            style={styles.card}
            onPress={() => router.push(`/search/influencer/${inf.id}`)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, styles.influencerAvatar]}>
                    <Text style={styles.avatarText}>{inf.name?.charAt(0) || '?'}</Text>
                </View>
                <View style={styles.cardInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{inf.name}</Text>
                        {inf.isVerified && (
                            <MaterialCommunityIcons name="check-decagram" size={14} color={COLORS.success} />
                        )}
                    </View>
                    <Text style={styles.niches}>{inf.niches}</Text>
                </View>
            </View>
            <Text style={styles.bio} numberOfLines={2}>{inf.bio}</Text>
            <View style={styles.cardStats}>
                <View style={styles.inlineStat}>
                    <MaterialCommunityIcons name="account-group" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.stat}>{formatFollowers(inf.followerCount)}</Text>
                </View>
                <View style={styles.inlineStat}>
                    <MaterialCommunityIcons name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.stat}>{inf.rating}</Text>
                </View>
                <View style={styles.inlineStat}>
                    <MaterialCommunityIcons name="cash" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.stat}>₹{inf.hourlyRate?.toLocaleString()}/hr</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderBusinessCard = (biz: BusinessProfile) => (
        <TouchableOpacity key={biz.id} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, styles.businessAvatar]}>
                    <Text style={styles.avatarText}>{biz.businessName?.charAt(0) || '?'}</Text>
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.name}>{biz.businessName}</Text>
                    <Text style={styles.niches}>{biz.category}</Text>
                </View>
            </View>
            <Text style={styles.bio} numberOfLines={2}>{biz.description}</Text>
            <View style={styles.addressRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.textSecondary} />
                <Text style={styles.address}>{biz.address}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Discover</Text>
                <Text style={styles.headerSubtitle}>Indore's Local Influencers & Businesses</Text>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'influencer' && styles.filterTabActive]}
                    onPress={() => setFilter('influencer')}
                >
                    <Text style={[styles.filterText, filter === 'influencer' && styles.filterTextActive]}>Influencers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'business' && styles.filterTabActive]}
                    onPress={() => setFilter('business')}
                >
                    <Text style={[styles.filterText, filter === 'business' && styles.filterTextActive]}>Businesses</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{influencers.length}</Text>
                    <Text style={styles.statLabel}>Influencers</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{businesses.length}</Text>
                    <Text style={styles.statLabel}>Businesses</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>Indore</Text>
                    <Text style={styles.statLabel}>Location</Text>
                </View>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {error ? (
                    <View style={styles.errorBanner}>
                        <MaterialCommunityIcons name="alert-circle" size={16} color={COLORS.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {renderMap()}

                {visibleInfluencers.map(renderInfluencerCard)}
                {visibleBusinesses.map(renderBusinessCard)}
                {!error && influencers.length === 0 && businesses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons name="map-search" size={48} color={COLORS.disabled} />
                        <Text style={styles.emptyText}>No profiles found</Text>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

function createLeafletMapHtml(markers: DiscoveryMarker[]) {
    const markerJson = JSON.stringify(markers).replace(/</g, '\\u003c');
    const primary = COLORS.primary;
    const secondary = COLORS.secondary;
    const centerLat = INDORE_CENTER.latitude;
    const centerLng = INDORE_CENTER.longitude;

    return `
<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #f3f4f6; }
    .leaflet-control-attribution { font-size: 9px; }
    .leaflet-popup-content-wrapper { border-radius: 8px; }
    .leaflet-popup-content { margin: 10px 12px; min-width: 150px; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .popup-title { font-size: 14px; font-weight: 800; color: #1A1A2E; margin-bottom: 2px; }
    .popup-subtitle { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
    .popup-detail { font-size: 12px; color: #6B7280; line-height: 16px; }
    .popup-action { border: 0; border-radius: 6px; background: ${primary}; color: #fff; padding: 7px 9px; margin-top: 8px; font-size: 12px; font-weight: 700; }
    .pin { width: 22px; height: 22px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #fff; box-shadow: 0 3px 8px rgba(0,0,0,0.30); }
    .pin span { display: block; width: 8px; height: 8px; margin: 5px; border-radius: 50%; background: #fff; }
    .pin.influencer { background: ${primary}; }
    .pin.business { background: ${secondary}; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const markers = ${markerJson};
    const map = L.map('map', { zoomControl: true, attributionControl: true }).setView([${centerLat}, ${centerLng}], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
      });
    }

    function sendInfluencer(id) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'influencer', id }));
    }

    markers.forEach(function(marker) {
      const icon = L.divIcon({
        className: '',
        html: '<div class="pin ' + marker.type + '"><span></span></div>',
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -24]
      });

      const popup = [
        '<div class="popup-title">' + escapeHtml(marker.title) + '</div>',
        '<div class="popup-subtitle">' + escapeHtml(marker.subtitle) + '</div>',
        '<div class="popup-detail">' + escapeHtml(marker.detail) + '</div>',
        marker.type === 'influencer'
          ? '<button class="popup-action" onclick="sendInfluencer(\\'' + escapeHtml(marker.id) + '\\')">Open profile</button>'
          : ''
      ].join('');

      L.marker([marker.lat, marker.lng], { icon }).addTo(map).bindPopup(popup);
    });

    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map(function(marker) { return [marker.lat, marker.lng]; }));
      map.fitBounds(bounds.pad(0.18), { maxZoom: 13 });
    }
  </script>
</body>
</html>`;
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { padding: 20, backgroundColor: COLORS.surface },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.textPrimary },
    headerSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
    filterContainer: { flexDirection: 'row', padding: 16, backgroundColor: COLORS.surface },
    filterTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20, marginHorizontal: 4, backgroundColor: COLORS.background },
    filterTabActive: { backgroundColor: COLORS.primary },
    filterText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
    filterTextActive: { color: COLORS.surface },
    statsBar: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 16, marginHorizontal: 16, marginTop: 8, borderRadius: 8 },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
    statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
    statDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 8 },
    errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.error + '12', marginBottom: 12, padding: 12, borderRadius: 8 },
    errorText: { flex: 1, fontSize: 13, color: COLORS.error, marginLeft: 8 },
    list: { flex: 1, padding: 16 },
    emptyState: { alignItems: 'center', padding: 32 },
    emptyText: { color: COLORS.textSecondary, fontSize: 15, marginTop: 12 },
    mapCard: { backgroundColor: COLORS.surface, borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
    mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 14 },
    mapTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
    mapSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    mapLegend: { alignItems: 'flex-end', gap: 6 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    influencerDot: { backgroundColor: COLORS.primary },
    businessDot: { backgroundColor: COLORS.secondary },
    legendText: { fontSize: 11, color: COLORS.textSecondary },
    mapShell: { height: 300, backgroundColor: COLORS.background },
    map: { flex: 1, backgroundColor: COLORS.background },
    mapFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: COLORS.background },
    mapFallbackText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center' },
    card: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 16, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    influencerAvatar: { backgroundColor: COLORS.primary },
    businessAvatar: { backgroundColor: COLORS.secondary },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: COLORS.surface },
    cardInfo: { flex: 1, marginLeft: 12 },
    nameRow: { flexDirection: 'row', alignItems: 'center' },
    name: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginRight: 6 },
    niches: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    bio: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 12 },
    cardStats: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
    inlineStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    stat: { fontSize: 14, color: COLORS.textSecondary },
    addressRow: { flexDirection: 'row', alignItems: 'center' },
    address: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 4 },
});
