import { PropertyRepositoryImpl } from "../../infrastructure/repositories/PropertyRepositoryImpl";

export const GetPropertiesUseCase = {
  async execute() {
    return await PropertyRepositoryImpl.getProperties();
  }
};
