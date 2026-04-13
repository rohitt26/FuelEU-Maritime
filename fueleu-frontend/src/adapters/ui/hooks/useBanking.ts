import { useState } from "react";
import { ComplianceApiAdapter } from "../../api/ComplianceApiAdapter";
import type {
  ApplyBankedResult,
  BankRecord,
  ComplianceBalance,
} from "../../../core/domain/Compliance";
import type { BankingSnapshot } from "../../../core/application/usecases/banking";

const api = new ComplianceApiAdapter();

export const useBanking = () => {
  const [snapshot, setSnapshot] = useState<BankingSnapshot | null>(null);
  const [lastApplication, setLastApplication] = useState<ApplyBankedResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = async (routeId: string, year: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const [cb, bank] = await Promise.all([
        api.getComplianceBalance(routeId, year),
        api.getBankRecord(routeId, year),
      ]);

      setSnapshot({ cb, bank });
      setLastApplication(null);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to load banking data.";
      setError(message);
      setSnapshot(null);
      setLastApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const bankSurplus = async (routeId: string, year: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await api.bankSurplus(routeId, year);
      const cb: ComplianceBalance =
        snapshot?.cb ?? (await api.getComplianceBalance(routeId, year));
      const bank: BankRecord = {
        routeId,
        year,
        amount: result.totalBanked,
      };

      setSnapshot({ cb, bank });
      setLastApplication(null);
      setSuccess(result.message);
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
      const result = await api.applyBanked(routeId, year, amount);
      const cb: ComplianceBalance = {
        routeId,
        year,
        cb: result.cb_after,
      };
      const bank: BankRecord = {
        routeId,
        year,
        amount: result.remainingBank,
      };

      setSnapshot({ cb, bank });
      setLastApplication(result);
      setSuccess("Banked surplus applied successfully.");
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
    snapshot,
    lastApplication,
    loading,
    error,
    success,
    fetchData,
    bankSurplus,
    applyBanked,
    clearMessages,
  };
};
