import { GraphQLUpload } from "graphql-upload";

import { uploadMultipleToS3 } from "../../../../aws/uploads3/s3Uploader";
import { JobStatus } from "../../../../generated/prisma";
import log from "../../../../lib/logger";
import {
  AuthError,
  ValidationError,
} from "../../../../utils/error-handler/error";
import { CreateJobResolverI } from "../../types";
import { createJobSchema } from "../../validation";
import { jobServices } from "../services";

export const jobResolvers = {
  Upload: GraphQLUpload,

  Query: {},

  Mutation: {
    createJob: async (_parent: unknown, args: { args: CreateJobResolverI }) => {
      log.debug(`Raw received input: ${JSON.stringify(args, null, 2)}`);

      const parsedInput = createJobSchema.safeParse(args.args);

      if (!parsedInput.success) {
        log.error(
          `Create Job validation error: ${parsedInput.error.errors[0].message}`,
        );
        throw new ValidationError(parsedInput.error.errors[0].message);
      }

      let images: string[] = [];

      try {
        if (Array.isArray(args.args.images)) {
          const resolvedFiles = await Promise.all(args.args.images);
          images = await uploadMultipleToS3(resolvedFiles);
        } else if (
          args.args.images &&
          typeof (args.args.images as Promise<unknown>).then === "function"
        ) {
          const file = await (args.args.images as Promise<{
            createReadStream: () => NodeJS.ReadableStream;
            filename: string;
            mimetype: string;
          }>);
          images = await uploadMultipleToS3([file]);
        }
      } catch (error) {
        log.error(`Failed to upload job image: ${(error as Error).message}`);
        throw new AuthError(
          "Failed to process file upload: " + (error as Error).message,
        );
      }

      const validStatuses = Object.values(JobStatus);
      const filteredData = {
        ...parsedInput.data,
        status: validStatuses.includes(parsedInput.data.status as JobStatus)
          ? (parsedInput.data.status as JobStatus)
          : JobStatus.OPEN,
      };

      try {
        return await jobServices.createJob({
          ...filteredData,
          images,
        });
      } catch (error) {
        log.error(`Unexpected error in createJob: ${error}`);
        throw new AuthError("Something went wrong. Please try again later.");
      }
    },
  },
};
