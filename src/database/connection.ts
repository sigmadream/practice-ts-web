import sqlite3 from 'sqlite3';
import path from 'path';
import logger from '../config/logger';

// SQLite3 데이터베이스 연결 클래스
export class DatabaseConnection {
    private db: sqlite3.Database | null = null;
    private dbPath: string;

    constructor(dbPath: string = 'db/pokedex.db') {
        this.dbPath = path.resolve(dbPath);
    }

    // 데이터베이스 연결
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    logger.error('데이터베이스 연결 실패:', err);
                    reject(err);
                } else {
                    logger.info(`데이터베이스 연결 성공: ${this.dbPath}`);
                    resolve();
                }
            });
        });
    }

    // 데이터베이스 연결 해제
    async disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        logger.error('데이터베이스 연결 해제 실패:', err);
                        reject(err);
                    } else {
                        logger.info('데이터베이스 연결 해제 성공');
                        this.db = null;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    // 쿼리 실행 (SELECT)
    async query(sql: string, params: any[] = []): Promise<any[]> {
        if (!this.db) {
            throw new Error('데이터베이스가 연결되지 않았습니다.');
        }

        return new Promise((resolve, reject) => {
            this.db!.all(sql, params, (err, rows) => {
                if (err) {
                    logger.error('쿼리 실행 실패:', err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 단일 행 조회
    async get(sql: string, params: any[] = []): Promise<any> {
        if (!this.db) {
            throw new Error('데이터베이스가 연결되지 않았습니다.');
        }

        return new Promise((resolve, reject) => {
            this.db!.get(sql, params, (err, row) => {
                if (err) {
                    logger.error('쿼리 실행 실패:', err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 연결 상태 확인
    isConnected(): boolean {
        return this.db !== null;
    }
}

// 싱글톤 인스턴스
let dbInstance: DatabaseConnection | null = null;

export const getDatabase = (): DatabaseConnection => {
    if (!dbInstance) {
        dbInstance = new DatabaseConnection();
    }
    return dbInstance;
};

export default DatabaseConnection;
