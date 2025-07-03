import { GraphQLUpload } from "graphql-upload";

import { uploadToS3 } from "../../../../aws/uploads3/s3Uploader";
import log from "../../../../lib/logger";
import {
  AuthError,
  ValidationError,
} from "../../../../utils/error-handler/error";
import { resumeServices } from "../services";
import { createResumeResolversI, createResumeServiceI } from "../types";
import { createResumeSchema } from "../validation";

export const resumeResolver = {
  Upload: GraphQLUpload,
  Query: {},
  Mutation: {
    createResume: async (
      _parent: unknown,
      args: { args: createResumeResolversI },
    ) => {
      log.warn(`rew recived input: ${JSON.stringify(args, null, 2)}`);

      const parsedInput = createResumeSchema.safeParse(args.args);

      if (!parsedInput.success) {
        log.warn(
          `Create Job validation error: ${parsedInput.error.errors[0].message}`,
        );
        throw new ValidationError(
          `Create Job validation error: ${parsedInput.error.errors[0].message}`,
        );
      }

      let profilePic: string | undefined;

      if (
        args.args.profilePic &&
        typeof args.args.profilePic === "object" &&
        "then" in args.args.profilePic
      ) {
        try {
          const file = await args.args.profilePic;
          profilePic = await uploadToS3(file);
        } catch (error) {
          throw new AuthError(
            "Failed to process file upload: " + (error as Error).message,
          );
        }
      }

      const serviceInput: createResumeServiceI = {
        ...parsedInput.data,
        profilePic: profilePic ?? "",
      };

      try {
        return await resumeServices.createResumeServices(serviceInput);
      } catch (error) {
        if (error instanceof AuthError || error instanceof ValidationError) {
          log.error(`create resume error: ${error}`);
          throw new AuthError(`create resume error: ${error}`);
        }
      }
    },
  },
};
