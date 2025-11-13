import { Timestamp } from 'firebase/firestore';
import type {
  Location,
  LocationCoordinates,
} from '@/domains/system/features/settings/locations/types/locationTypes';
import type { LocationData } from '../types';

const resolveCoordinates = (location: Location): LocationCoordinates | undefined =>
  location.coordinates ?? (location as { gpsCoordinates?: LocationCoordinates }).gpsCoordinates;

/**
 * Calculate the distance between two GPS coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // Convert to radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  return distance;
}

/**
 * Check if a user's location is within the geofence radius of a location
 * @param userLocation User's current GPS coordinates
 * @param location Location with geofence settings
 * @returns Object with isWithinGeofence flag and distance in meters
 */
export function checkGeofence(
  userLocation: LocationData,
  location: Location
): {
  isWithinGeofence: boolean;
  distance: number;
  maxRadius: number;
  locationName: string;
} {
  const coordinates = resolveCoordinates(location);
  if (!coordinates) {
    throw new Error('Location does not have GPS coordinates configured');
  }

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    coordinates.latitude,
    coordinates.longitude
  );

  const maxRadius = location.geofenceRadius || 100; // Default 100m if not set

  return {
    isWithinGeofence: distance <= maxRadius,
    distance: Math.round(distance),
    maxRadius,
    locationName: location.name,
  };
}

/**
 * Check if a user's location is within any of the allowed locations' geofences
 * @param userLocation User's current GPS coordinates
 * @param locations Array of allowed locations
 * @returns Object with validation result and details
 */
export function checkMultipleGeofences(
  userLocation: LocationData,
  locations: Location[]
): {
  isValid: boolean;
  nearestLocation?: Location;
  distance?: number;
  allDistances: Array<{
    location: Location;
    distance: number;
    isWithinGeofence: boolean;
  }>;
} {
  if (locations.length === 0) {
    return {
      isValid: false,
      allDistances: [],
    };
  }

  const results = locations
    .filter((loc) => resolveCoordinates(loc)) // Only check locations with GPS
    .map((location) => {
      const result = checkGeofence(userLocation, location);
      return {
        location,
        distance: result.distance,
        isWithinGeofence: result.isWithinGeofence,
      };
    })
    .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

  if (results.length === 0) {
    return {
      isValid: false,
      allDistances: [],
    };
  }

  const nearestValid = results.find((r) => r.isWithinGeofence);

  if (nearestValid) {
    return {
      isValid: true,
      nearestLocation: nearestValid.location,
      distance: nearestValid.distance,
      allDistances: results,
    };
  }

  // Not within any geofence, return nearest location
  const nearest = results[0];
  return {
    isValid: false,
    allDistances: results,
    ...(nearest
      ? {
          nearestLocation: nearest.location,
          distance: nearest.distance,
        }
      : {}),
  };
}

/**
 * Get user's current location from browser
 * @returns Promise with LocationData or error
 */
export function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Timestamp.fromMillis(position.timestamp ?? Date.now()),
        });
      },
      (error) => {
        let message = 'Unable to retrieve location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}
