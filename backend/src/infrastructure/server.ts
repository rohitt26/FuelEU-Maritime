import express from "express";
import cors from "cors";
import routesController from "../adapters/inbound/http/routes.controller";
import complianceController from "../adapters/inbound/http/compliance.controller";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/compliance", complianceController);
app.use("/routes", routesController);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});