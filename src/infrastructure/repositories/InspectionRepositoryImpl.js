import { apiClient, ENDPOINTS } from "../api/apiClient";

export const InspectionRepositoryImpl = {
  /**
   * Submits a property inspection booking to the backend.
   * Maps domain-level field names to the exact API payload schema.
   *
   * Payload schema:
   *  { property_id, customer_name, email, phone, preferred_date, token }
   *
   * @param {object} inspectionData - domain fields from BookInspectionUseCase
   * @returns {Promise<any>}        - raw API response
   * @throws  Propagates any axios/network error to the caller.
   */
  async bookInspection(inspectionData) {
    const payload = {
      property_id:    inspectionData.propertyId,
      customer_name:  inspectionData.customerName,
      email:          inspectionData.email,
      phone:          inspectionData.phone,
      preferred_date: inspectionData.preferredDate, // "DD|MM|YYYY"
      token:          inspectionData.token,
    };

    const response = await apiClient.post(ENDPOINTS.bookInspection, payload);
    return response;
  },
};
