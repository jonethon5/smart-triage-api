import express from "express";
import { authRouter } from "./auth/routes";
import { ticketsRouter } from "./tickets/routes";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/auth", authRouter);

app.use("/tickets", ticketsRouter);
app.use("/auth", authRouter);
