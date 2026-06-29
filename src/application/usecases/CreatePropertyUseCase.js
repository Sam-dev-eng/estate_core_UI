import { PropertyRepositoryImpl } from "../../infrastructure/repositories/PropertyRepositoryImpl";

export const CreatePropertyUseCase = {
  async execute(propertyData, token) {
    if (!propertyData.title || propertyData.title.trim() === "") {
      throw new Error("Property title is required");
    }
    if (!propertyData.price || isNaN(Number(propertyData.price))) {
      throw new Error("A valid numeric price is required");
    }
    if (!propertyData.location || propertyData.location.trim() === "") {
      throw new Error("Property location is required");
    }

    return await PropertyRepositoryImpl.createProperty(propertyData, token);
  }
};
