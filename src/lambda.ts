import serverlessExpress from "@vendia/serverless-express";

import { app as expressHandler } from "./index";

export const handler = serverlessExpress({ app: expressHandler });
