export interface LogEntry {
    readonly host: string;
    readonly statusCode: number | null;
    readonly ms: number;
  }