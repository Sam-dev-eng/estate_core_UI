import { apiClient, ENDPOINTS } from "../api/apiClient";
import { Property } from "../../domain/entities/Property";

export const PropertyRepositoryImpl = {
  /**
   * Fetches all property listings from the backend.
   * Maps each raw API object through Property.fromRaw() to normalise
   * the loaction/location typo and gallery structure.
   *
   * @returns {Promise<Property[]>}
   * @throws  Propagates any axios/network error to the caller (use case / page).
   */
  async getProperties() {
    const response = await apiClient.get(ENDPOINTS.properties);

    // Frappe wraps data inside response.message.data
    const rawList = response?.message?.data ?? response?.data ?? [];

    if (!Array.isArray(rawList)) {
      console.warn("[PropertyRepository] Unexpected response shape:", response);
      return [];
    }

    return rawList
      .map((item) => Property.fromRaw(item))
      .filter(Boolean); // drop any null entries from malformed objects
  },

  /**
   * Creates a new property listing via the backend.
   * Sends the exact payload schema required by the API contract.
   *
   * @param {object} propertyData - domain-level property fields
   * @param {string} token        - JWT auth token
   * @returns {Promise<any>}      - raw API response
   * @throws  Propagates any axios/network error to the caller.
   */
  async createProperty(propertyData, token) {
    const payload = {
      title:         propertyData.title,
      description:   propertyData.description,
      location:      propertyData.location,
      price:         String(propertyData.price),
      property_type: propertyData.propertyType || propertyData.property_type || "House",
      bedroom:       String(propertyData.bedroom  || "1"),
      bathroom:      String(propertyData.bathroom || "1"),
      images: Array.isArray(propertyData.images)
        ? propertyData.images
        : [propertyData.image].filter(Boolean),
    };

    const response = await apiClient.post(ENDPOINTS.createProperty, payload, token);
    return response;
  },
};
