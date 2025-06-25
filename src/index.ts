import cookieParser from "cookie-parser";
import express from "express";
import { graphqlHTTP } from "express-graphql";
import { graphqlUploadExpress } from "graphql-upload"; // Now available in v11.0.0

import { createContext } from "./graphql/context/context";
import { rootSchema } from "./graphql/schema/schema";
import { config } from "./lib/config";
import { limiter } from "./lib/rate-limit";
import { errorHandler } from "./utils/error-handler/error-handler";

const app = express();

app.use(graphqlUploadExpress({ maxFileSize: 20 * 1024 * 1024, maxFiles: 1 })); // 20MB limit, 1 file
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

if (process.env.NODE_ENV !== "lambda") {
  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}