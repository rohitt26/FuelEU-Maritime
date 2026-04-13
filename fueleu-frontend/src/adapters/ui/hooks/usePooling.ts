import { useEffect, useState } from "react";
import { RouteApiAdapter } from "../../api/RouteApiAdapter";
import { ComplianceApiAdapter } from "../../api/ComplianceApiAdapter";
import type { Route } from "../../../core/domain/Route";
import type { Pool } from "../../../core/domain/Compliance";
import {
  buildPoolingPreview,
  type PoolingPreview,
} from "../../../core/application/usecases/pooling";

const routeApi = new RouteApiAdapter();
const complianceApi = new ComplianceApiAdapter();

export const usePooling = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [pools, setPools] = useState<Pool[]>([]);
  const [preview, setPreview] = useState<PoolingPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRoutes = async () => {
    const data = await routeApi.getRoutes();
    setRoutes(data);
  };

  const fetchPools = async () => {
    const data = await complianceApi.getPools();
    setPools(data);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([fetchRoutes(), fetchPools()]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to load pooling data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchRoutes(), fetchPools()]);
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : "Unable to load pooling data.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, []);

  const previewPool = async (routeIds: string[], year: number) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const adjustedBalances = await Promise.all(
        routeIds.map(async (routeId) => {
          await complianceApi.getComplianceBalance(routeId, year);
          return complianceApi.getAdjustedComplianceBalance(routeId, year);
        })
      );

      const nextPreview = buildPoolingPreview(
        adjustedBalances.map((balance) => ({
          routeId: balance.routeId,
          year: balance.year,
          adjustedCB: balance.adjustedCB,
        }))
      );

      setPreview(nextPreview);
      return nextPreview;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to preview the pool.";
      setError(message);
      setPreview(null);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const createPool = async (routeIds: string[], year: number) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const pool = await complianceApi.createPool(routeIds, year);
      setPools((currentPools) => [pool, ...currentPools]);
      setPreview({
        members: pool.members.map((member) => ({
          routeId: member.routeId,
          year: member.year,
          cbBefore: member.cb_before,
          cbAfter: member.cb_after,
        })),
        totalCB: pool.members.reduce((sum, member) => sum + member.cb_before, 0),
        isValid: true,
        issues: [],
      });
      setSuccess("Pool created successfully.");
      return pool;
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to create pool.";
      setError(message);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    routes,
    pools,
    preview,
    loading,
    submitting,
    error,
    success,
    previewPool,
    createPool,
    refetch: fetchAll,
  };
};
