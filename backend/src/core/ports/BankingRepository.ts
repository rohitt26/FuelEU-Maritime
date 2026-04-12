export interface BankEntry {
  routeId: string;
  year: number;
  amount: number;
}

export interface BankingRepository {
  getAll(): Promise<BankEntry[]>;
  saveAll(entries: BankEntry[]): Promise<void>;

  find(routeId: string, year: number): Promise<BankEntry | null>;
  upsert(entry: BankEntry): Promise<void>;
}