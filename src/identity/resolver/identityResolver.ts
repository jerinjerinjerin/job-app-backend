import express from "express";

import { AuthError, ValidationError } from "../../utils/error-handler/error";
import { authServices } from "../service/identityServicies";
import { LoginI, OtpI, SignI } from "../types";
import { 
    signupSchema, 
    loginSchema, 
    verifyOtpSchema 
  } from "../validation/index";

export const authResolvers = {
  Mutation: {
    signup: async (
      _: any,
      args: { input: SignI }
    ) => {
      const signUpInput = signupSchema.safeParse(args.input);

      if (!signUpInput.success) {
        throw new ValidationError(signUpInput.error?.errors?.[0]?.message);
      }

      try {
        return await authServices.signupService(signUpInput.data);
      } catch (error) {
        if (error instanceof Error) {
          throw new AuthError(error.message);
        }
      }
    },
    verifyOtp: async(_:any, args: {input: OtpI}) => {
      try {
        const OtpInput = verifyOtpSchema.safeParse(args.input);

        if(!OtpInput.success){
          throw new ValidationError(OtpInput.error?.errors?.[0]?.message);
        }

        console.log("Verifying OTP for email:", OtpInput.data.email); 

        return await authServices.verifyOtpService(OtpInput.data);

      } catch (error) {
        if(error instanceof Error){
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
