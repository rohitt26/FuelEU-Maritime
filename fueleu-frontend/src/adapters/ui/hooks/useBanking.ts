import { useEffect, useState } from "react";
import { ComplianceApiAdapter } from "../../api/ComplianceApiAdapter";
import { RouteApiAdapter } from "../../api/RouteApiAdapter";
import type {
  ApplyBankedResult,
  BankRecord,
  ComplianceBalance,
} from "../../../core/domain/Compliance";
import {
  buildBankingRows,
  type BankingTableRow,
} from "../../../core/application/usecases/banking";

const complianceApi = new ComplianceApiAdapter();
const routeApi = new RouteApiAdapter();

export const useBanking = () => {
  const [rows, setRows] = useState<BankingTableRow[]>([]);
  const [bank, setBank] = useState<BankRecord>({ balance: 0, transactions: [] });
  const [selectedBalance, setSelectedBalance] = useState<ComplianceBalance | null>(null);
  const [lastApplication, setLastApplication] = useState<ApplyBankedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [routes, balances, bankSnapshot] = await Promise.all([
        routeApi.getRoutes(),
        complianceApi.getComplianceBalances(),
        complianceApi.getBankRecord("", 0),
      ]);

      setRows(buildBankingRows(routes, balances, bankSnapshot.transactions));
      setBank(bankSnapshot);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to load banking data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const calculateComplianceBalance = async (routeId: string, year: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const balance = await complianceApi.calculateComplianceBalance(routeId, year);
      setSelectedBalance(balance);
      setLastApplication(null);
      setSuccess("Compliance balance calculated successfully.");
      await fetchData();
      return balance;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to calculate compliance balance.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const selectComplianceBalance = async (routeId: string, year: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const balance = await complianceApi.getComplianceBalance(routeId, year);
      setSelectedBalance(balance);
      setLastApplication(null);
      return balance;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load compliance balance.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const bankSurplus = async (routeId: string, year: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await complianceApi.bankSurplus(routeId, year);
      const balance =
        selectedBalance?.routeId === routeId && selectedBalance?.year === year
          ? selectedBalance
          : await complianceApi.getComplianceBalance(routeId, year);

      setSelectedBalance(balance);
      setLastApplication(null);
      setSuccess(result.message);
      await fetchData();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to bank surplus.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const applyBanked = async (routeId: string, year: number, amount: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await complianceApi.applyBanked(routeId, year, amount);
      setSelectedBalance({
        routeId,
        year,
        cb: result.cb_after,
      });
      setLastApplication(result);
      setSuccess("Banked surplus applied successfully.");
      await fetchData();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to apply banked surplus.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    rows,
    bank,
    selectedBalance,
    lastApplication,
    loading,
    error,
    success,
    fetchData,
    calculateComplianceBalance,
    selectComplianceBalance,
    bankSurplus,
    applyBanked,
    clearMessages,
  };
};
