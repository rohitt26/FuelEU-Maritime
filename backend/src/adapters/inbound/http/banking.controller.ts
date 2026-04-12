import { Router } from "express";
import { BankingRepositoryFile } from "../../outbound/file/BankingRepositoryFile";
import { ComplianceRepositoryFile } from "../../outbound/file/ComplianceRepositoryFile";
import { GetBankRecords } from "../../../core/application/GetBankRecords";
import { BankSurplus } from "../../../core/application/BankSurplus";
import { ApplyBanked } from "../../../core/application/ApplyBanked";

const router = Router();

const bankingRepo = new BankingRepositoryFile();
const complianceRepo = new ComplianceRepositoryFile();

const getRecords = new GetBankRecords(bankingRepo);
const bankSurplus = new BankSurplus(complianceRepo, bankingRepo);
const applyBanked = new ApplyBanked(complianceRepo, bankingRepo);

// GET /banking/records
router.get("/records", async (req, res) => {
  const { routeId, year } = req.query;

  const data = await getRecords.execute(
    routeId as string,
    Number(year)
  );

  res.json(data);
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

export default router;