import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseConnection } from '../database/connection';
import path from 'path';

describe('DatabaseConnection', () => {
    let db: DatabaseConnection;

    beforeEach(() => {
        db = new DatabaseConnection('db/pokedex.db');
    });

    afterEach(async () => {
        if (db.isConnected()) {
            await db.disconnect();
        }
    });

    describe('연결 관리', () => {
        it('데이터베이스에 연결할 수 있어야 한다', async () => {
            await expect(db.connect()).resolves.not.toThrow();
            expect(db.isConnected()).toBe(true);
        });

        it('데이터베이스 연결을 해제할 수 있어야 한다', async () => {
            await db.connect();
            await expect(db.disconnect()).resolves.not.toThrow();
            expect(db.isConnected()).toBe(false);
        });

        it('연결되지 않은 상태에서 쿼리를 실행하면 에러가 발생해야 한다', async () => {
            await expect(db.query('SELECT 1')).rejects.toThrow('데이터베이스가 연결되지 않았습니다.');
        });
    });

    describe('쿼리 실행', () => {
        beforeEach(async () => {
            await db.connect();
        });

        it('SELECT 쿼리를 실행할 수 있어야 한다', async () => {
            const result = await db.query('SELECT 1 as test');
            expect(result).toHaveLength(1);
            expect(result[0].test).toBe(1);
        });

        it('파라미터가 있는 쿼리를 실행할 수 있어야 한다', async () => {
            const result = await db.query('SELECT ? as value', [42]);
            expect(result).toHaveLength(1);
            expect(result[0].value).toBe(42);
        });

        it('단일 행을 조회할 수 있어야 한다', async () => {
            const result = await db.get('SELECT 1 as test');
            expect(result.test).toBe(1);
        });

        it('존재하지 않는 행을 조회하면 undefined를 반환해야 한다', async () => {
            const result = await db.get('SELECT * FROM pokemon WHERE id = -1');
            expect(result).toBeUndefined();
        });
    });

    describe('포켓몬 테이블 테스트', () => {
        beforeEach(async () => {
            await db.connect();
        });

        it('포켓몬 테이블이 존재해야 한다', async () => {
            const result = await db.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='pokemon'
      `);
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('pokemon');
        });

        it('포켓몬 데이터가 존재해야 한다', async () => {
            const result = await db.query('SELECT COUNT(*) as count FROM pokemon');
            expect(result[0].count).toBeGreaterThan(0);
        });

        it('첫 번째 포켓몬을 조회할 수 있어야 한다', async () => {
            const result = await db.get('SELECT * FROM pokemon LIMIT 1');
            expect(result).toBeDefined();
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name');
        });

        it('포켓몬 이름으로 검색할 수 있어야 한다', async () => {
            const result = await db.query(
                'SELECT * FROM pokemon WHERE name LIKE ? LIMIT 5',
                ['%피카%']
            );
            expect(Array.isArray(result)).toBe(true);
        });
    });
});
