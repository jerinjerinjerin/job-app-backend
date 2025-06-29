import { GraphQLUpload } from "graphql-upload";

import { uploadToS3 } from "../../../aws/uploads3/s3Uploader";
import { AuthError, ValidationError } from "../../../utils/error-handler/error";
import { CompanyResolverI, CompanyVerifyI } from "../../types";
import { createCompanySchema, verifyCompanyOtpSchema } from "../../validation";
import { companyService } from "../companyServices";

export const companyResolvers = {
  Upload: GraphQLUpload,

  Query: {},

  Mutation: {
    createCompany: async (
      _parent: unknown,
      { input }: { input: CompanyResolverI },
    ) => {
      console.log("Raw received input:", JSON.stringify(input, null, 2));

      const parsedInput = createCompanySchema.safeParse(input);

      if (!parsedInput.success) {
        throw new ValidationError(parsedInput.error.errors[0].message);
      }

      let logoUrl: string | undefined;

      if (
        input.logo &&
        typeof input.logo === "object" &&
        "then" in input.logo
      ) {
        try {
          const file = await input.logo;
          logoUrl = await uploadToS3(file);
        } catch (error) {
          throw new AuthError(
            "Failed to process file upload: " + (error as Error).message,
          );
        }
      }

      const serviceInput = {
        ...parsedInput.data,
        logo: logoUrl ?? "",
        description: parsedInput.data.description ?? "",
        website: parsedInput.data.website ?? "",
      };

      try {
        return await companyService.createCompanyService(serviceInput);
      } catch (error) {
        throw new AuthError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        );
      }
    },
    verifyCompanyOtp: async (
      _parent: unknown,
      { input }: { input: CompanyVerifyI },
    ) => {
      const parsedInput = verifyCompanyOtpSchema.safeParse(input);

      if (!parsedInput.success) {
        throw new ValidationError(parsedInput.error.errors[0].message);
      }

      try {
        return await companyService.verifyCompanyOtp(parsedInput.data);
      } catch (error) {
        throw new AuthError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        );
      }
    },
  },
};
