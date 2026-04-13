import express, { Router } from "express";
import cors from "cors";
import routesController from "../adapters/inbound/http/routes.controller";
import complianceController from "../adapters/inbound/http/compliance.controller";
import bankingController from "../adapters/inbound/http/banking.controller";
import poolController from "../adapters/inbound/http/pool.controller";

type AppRouters = {
  pools?: Router;
  banking?: Router;
  compliance?: Router;
  routes?: Router;
};

export function createApp(routers: AppRouters = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/pools", routers.pools ?? poolController);
  app.use("/banking", routers.banking ?? bankingController);
  app.use("/compliance", routers.compliance ?? complianceController);
  app.use("/routes", routers.routes ?? routesController);

  return app;
}
