import { Router } from "express";
import { BankingRepositoryPg } from "../../outbound/postgres/BankingRepositoryPg";
import { ComplianceRepositoryPg } from "../../outbound/postgres/ComplianceRepositoryPg";
import { GetBankRecords } from "../../../core/application/GetBankRecords";
import { BankSurplus } from "../../../core/application/BankSurplus";
import { ApplyBanked } from "../../../core/application/ApplyBanked";
import { BankingRepository } from "../../../core/ports/BankingRepository";
import { ComplianceRepository } from "../../../core/ports/ComplianceRepository";

type BankingControllerDeps = {
  bankingRepo?: BankingRepository;
  complianceRepo?: ComplianceRepository;
};

export function createBankingController(
  deps: BankingControllerDeps = {}
): Router {
  const router = Router();
  const bankingRepo = deps.bankingRepo ?? new BankingRepositoryPg();
  const complianceRepo = deps.complianceRepo ?? new ComplianceRepositoryPg();

  const getRecords = new GetBankRecords(bankingRepo);
  const bankSurplus = new BankSurplus(complianceRepo, bankingRepo);
  const applyBanked = new ApplyBanked(complianceRepo, bankingRepo);

  // GET /banking/records
  router.get("/records", async (_req, res) => {
    const record = await getRecords.execute();
    res.json(record);
  });

  // POST /banking/bank
  router.post("/bank", async (req, res) => {
    try {
      const { routeId, year } = req.body;

      const result = await bankSurplus.execute(routeId, year);

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // POST /banking/apply
  router.post("/apply", async (req, res) => {
    try {
      const { routeId, year, amount } = req.body;

      const result = await applyBanked.execute(routeId, year, amount);

      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}

export default createBankingController();
