export declare class AuditLog {
    id: string;
    userId: string;
    action: string;
    tableName: string;
    recordId: string;
    oldData: Record<string, unknown>;
    newData: Record<string, unknown>;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
}
//# sourceMappingURL=AuditLog.d.ts.map