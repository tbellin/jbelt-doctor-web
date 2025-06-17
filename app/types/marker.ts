// types/marker.ts
// Re-export from model for backward compatibility
export type { IMarker as Marker, Marker as MarkerClass } from '~/model/marker.model'

// Legacy interface for backward compatibility
export interface MarkerLegacy {
    id?: number;
    code?: string;
    name: string;
    symbolName?: string;
    fileId?: number;
}