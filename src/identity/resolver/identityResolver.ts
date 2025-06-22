import express from "express";

import { AuthError, ValidationError } from "../../utils/error-handler/error";
import { authServices } from "../service/identityServicies";
import { LoginI, SignI } from "../types";
import { signupSchema, loginSchema } from "../validation/index";

export const authResolvers = {
  Mutation: {
    signup: async (
      _: any,
      args: { input: SignI },
      context: { req: express.Request; res: express.Response },
    ) => {
      const signUpInput = signupSchema.safeParse(args.input);

      if (!signUpInput.success) {
        throw new ValidationError(signUpInput.error?.errors?.[0]?.message);
      }

      try {
        return await authServices.signupService(signUpInput.data, context);
      } catch (error) {
        if (error instanceof Error) {
          throw new AuthError(error.message);
        }
      }
    },

    login: async (
      _: any,
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

    googleLogin: async (_: any, args: any) => {
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
