export interface ComplianceRecord {
  routeId: string;
  year: number;
  cb: number;
}

export interface ComplianceRepository {
  save(record: ComplianceRecord): Promise<void>;
  find(routeId: string, year: number): Promise<ComplianceRecord | null>;
  getAll(): Promise<ComplianceRecord[]>;
}