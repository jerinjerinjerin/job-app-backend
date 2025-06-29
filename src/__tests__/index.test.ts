import request from "supertest";

import { app } from "../index";

describe("GraphQL API", () => {
  it("responds to a basic query", async () => {
    const res = await request(app).post("/graphql").send({
      query: "{ __typename }",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("__typename");
  });

  it("handles invalid query", async () => {
    const res = await request(app).post("/graphql").send({
      query: "{ invalidField }",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });
});
