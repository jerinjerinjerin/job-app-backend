import { GraphQLUpload } from "graphql-upload";

import { uploadToS3 } from "../../../../aws/uploads3/s3Uploader";
import log from "../../../../lib/logger";
import {
  AuthError,
  ValidationError,
} from "../../../../utils/error-handler/error";
import { applicationService } from "../services";
import { ApplicationResolverI, ApplicationServiceI } from "../types";
import { createApplicationSchema } from "../validation";

export const applicationResolver = {
  Upload: GraphQLUpload,
  Query: {},
  Mutation: {
    createApplication: async (
      _parent: unknown,
      args: { args: ApplicationResolverI },
    ) => {
      log.warn(`rew recived input: ${JSON.stringify(args, null, 2)}`);

      const parsedInput = createApplicationSchema.safeParse(args.args);

      if (!parsedInput.success) {
        log.warn(
          `Create Job validation error: ${parsedInput.error.errors[0].message}`,
        );
        throw new ValidationError(
          `Create Job validation error: ${parsedInput.error.errors[0].message}`,
        );
      }

      let resumeUrl: string | undefined;

      if (
        args.args.resumeUrl &&
        typeof args.args.resumeUrl === "object" &&
        "then" in args.args.resumeUrl
      ) {
        try {
          const file = await args.args.resumeUrl;
          resumeUrl = await uploadToS3(file);
        } catch (error) {
          throw new AuthError(
            "Failed to process file upload: " + (error as Error).message,
          );
        }
      }

      const serviceInput: ApplicationServiceI = {
        ...parsedInput.data,
        resumeUrl: resumeUrl ?? "",
        coverNote: parsedInput.data.coverNote ?? "",
      };

      try {
        return await applicationService.createApplication(serviceInput);
      } catch (error) {
        if (error instanceof AuthError || error instanceof ValidationError) {
          log.error(`error from create application resolvers ${error}`);
          throw new AuthError(
            `error from create application resolvers ${error}`,
          );
        }
      }
    },
  },
};
