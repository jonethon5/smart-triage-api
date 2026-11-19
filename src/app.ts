import express from "express";
import { authRouter } from "./auth/routes";
import { ticketsRouter } from "./tickets/routes";

export const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/tickets", ticketsRouter);
