export interface LogEntry {
    readonly host: string;
    readonly statusCode: number;
    readonly ms: number;
  }