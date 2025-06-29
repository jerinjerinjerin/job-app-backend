import express from "express";
import { GraphQLUpload } from "graphql-upload";

import { uploadToS3 } from "../../aws/uploads3/s3Uploader";
import { AuthError, ValidationError } from "../../utils/error-handler/error";
import { authServices } from "../service/identityServicies";
import { LoginI, OtpI, SignI } from "../types";
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
} from "../validation/index";

export const authResolvers = {
  Query: {
    _empty: () => "OK",
  },
  Upload: GraphQLUpload,
  Mutation: {
    signup: async (_parent: unknown, { input }: { input: SignI }) => {
      const signUpInput = signupSchema.safeParse({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
      });

      if (!signUpInput.success) {
        throw new ValidationError(signUpInput.error?.errors?.[0]?.message);
      }

      let profilePicUrl: string | undefined = undefined;

      try {
        if (
          input.profilePic &&
          typeof input.profilePic === "object" &&
          "then" in input.profilePic
        ) {
          const file = await input.profilePic;
          profilePicUrl = await uploadToS3(file);
        } else {
          console.warn("No valid profilePic provided in input");
        }
      } catch (error) {
        throw new AuthError(
          "Failed to process file upload: " + (error as Error).message,
        );
      }

      const serviceInput = {
        ...signUpInput.data,
        profilePic: profilePicUrl,
      };

      try {
        return await authServices.signupService(serviceInput);
      } catch (error) {
        if (error instanceof Error) {
          throw new AuthError(error.message);
        }
      }
    },

    verifyOtp: async (_parent: unknown, args: { input: OtpI }) => {
      try {
        const parsed = verifyOtpSchema.safeParse(args.input);

        if (!parsed.success) {
          throw new ValidationError(parsed.error?.errors?.[0]?.message);
        }

        const result = await authServices.verifyOtpService(parsed.data);

        if (
          !result ||
          !result.user ||
          !result.accessToken ||
          !result.refreshToken
        ) {
          throw new AuthError("Failed to verify OTP or generate tokens");
        }

        return result;
      } catch (error) {
        if (error instanceof Error) {
          throw new AuthError(error.message);
        }

        throw new AuthError("Unexpected OTP verification error");
      }
    },

    login: async (
      _parent: unknown,
      args: { input: LoginI },
      context: { req: express.Request; res: express.Response },
    ) => {
      const loginInput = loginSchema.safeParse(args.input);

      if (!loginInput.success) {
        throw new ValidationError(loginInput.error?.errors?.[0]?.message);
      }

      try {
        return await authServices.loginService(loginInput.data, context);
      } catch (error) {
        if (error instanceof Error) {
          throw new AuthError(error.message);
        }
      }
    },

    refreshToken: async (
      _: any,
      __: any,
      context: { req: express.Request; res: express.Response },
    ) => {
      try {
        return await authServices.refreshTokenService(context);
      } catch (error) {
        if (error instanceof Error) {
          throw new AuthError(error.message);
        }
      }
    },

    googleLogin: async (_parent: unknown, args: any) => {
      try {
        return await authServices.googleLoginService(args.input);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    },

    logout: async (
      _: any,
      __: any,
      context: { req: express.Request; res: express.Response },
    ) => {
      return await authServices.logoutService(context);
    },
  },
};
