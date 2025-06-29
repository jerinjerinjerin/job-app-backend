import cookieParser from "cookie-parser";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { graphqlUploadExpress } from "graphql-upload";

import { createContext } from "./graphql/context/context";
import { rootSchema } from "./graphql/schema/schema";
import { config } from "./lib/config";
import log from "./lib/logger";
import { limiter } from "./lib/rate-limit";
import { errorHandler } from "./utils/error-handler/error-handler";

const app = express();

app.use(graphqlUploadExpress({ maxFileSize: 20 * 1024 * 1024, maxFiles: 1 }));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());
app.use(limiter);
app.use(errorHandler);

app.use("/graphql", (req, res) =>
  graphqlHTTP({
    schema: rootSchema,
    graphiql: true,
    context: createContext(req, res),
  })(req, res),
);

export { app };

if (process.env.NODE_ENV !== "lambda" && process.env.NODE_ENV !== "test") {
  const PORT = config.port;
  app.listen(PORT, () => {
    log.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}
