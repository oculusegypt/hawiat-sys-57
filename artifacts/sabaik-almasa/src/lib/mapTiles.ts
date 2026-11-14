const configuredTileUrl = import.meta.env.VITE_MAP_TILE_URL?.trim()
const configuredTileAttribution = import.meta.env.VITE_MAP_TILE_ATTRIBUTION?.trim()

export const MAP_TILE_URL = configuredTileUrl || "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
export const MAP_TILE_ATTRIBUTION = configuredTileAttribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
