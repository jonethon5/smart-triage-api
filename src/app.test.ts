import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./app";

describe("app", () => {
  it("GET /health responde 200 com status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("rota inexistente responde 404 em JSON", async () => {
    const res = await request(app).get("/rota-que-nao-existe");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Rota não encontrada" });
  });

  it("JSON malformado responde 400 em JSON", async () => {
    const res = await request(app)
      .post("/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email": ');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "JSON inválido" });
  });

  it("listar tickets sem token responde 401", async () => {
    const res = await request(app).get("/tickets");
    expect(res.status).toBe(401);
  });
});
