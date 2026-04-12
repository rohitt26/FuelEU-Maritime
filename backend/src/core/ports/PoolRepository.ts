export interface PoolMember {
  routeId: string;
  year: number;
  cb_before: number;
  cb_after: number;
}

export interface Pool {
  id: string;
  year: number;
  members: PoolMember[];
  createdAt: string;
}

export interface PoolRepository {
  getAll(): Promise<Pool[]>;
  save(pool: Pool): Promise<void>;
}