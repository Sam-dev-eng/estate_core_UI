import { InspectionRepositoryImpl } from "../../infrastructure/repositories/InspectionRepositoryImpl";

export const BookInspectionUseCase = {
  async execute(inspectionData) {
    if (!inspectionData.propertyId) {
      throw new Error("Property ID is required to book an inspection");
    }
    if (!inspectionData.customerName) {
      throw new Error("Customer name is required");
    }
    if (!inspectionData.email) {
      throw new Error("Email is required");
    }
    if (!inspectionData.phone) {
      throw new Error("Phone number is required");
    }
    if (!inspectionData.preferredDate) {
      throw new Error("Preferred inspection date is required");
    }
    if (!inspectionData.token) {
      throw new Error("User must be authenticated to schedule inspections");
    }

    return await InspectionRepositoryImpl.bookInspection(inspectionData);
  }
};
