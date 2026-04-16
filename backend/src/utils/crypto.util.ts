import { v7 as uuidv7 } from "uuid";

export class CryptoUtil {
    /**
     * Generates a universally unique identifier version 7 (UUIDv7)
     * UUIDv7 is a timestamp-based, strictly monotonically sortable UUID,
     * making it highly optimized for database primary keys.
     * 
     * @returns {string} string representation of UUIDv7
     */
    static generateUUID(): string {
        return uuidv7();
    }
}
