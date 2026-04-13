export interface ComplianceBalance {
  routeId: string;
  year: number;
  cb: number;
}

export interface AdjustedComplianceBalance extends ComplianceBalance {
  adjustedCB: number;
}

export interface BankRecord {
  routeId: string;
  year: number;
  amount: number;
}

export interface BankSurplusResult {
  message: string;
  banked: number;
  totalBanked: number;
}

export interface ApplyBankedResult {
  applied: number;
  cb_before: number;
  cb_after: number;
  remainingBank: number;
}

export interface PoolMember {
  routeId: string;
  year: number;
  cb_before: number;
  cb_after: number;
}

export interface Pool {
  id: string;
  year: number;
  createdAt: string;
  members: PoolMember[];
}
