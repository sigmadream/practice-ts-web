import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { getDatabase } from '../database/connection';

describe('Pokemon API Routes', () => {
    beforeAll(async () => {
        // 데이터베이스 연결
        await getDatabase().connect();
    });

    afterAll(async () => {
        // 데이터베이스 연결 해제
        await getDatabase().disconnect();
    });

    describe('GET /api/pokemon', () => {
        it('포켓몬 목록을 조회할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.pagination.total).toBeGreaterThan(0);
        });

        it('페이지네이션 파라미터를 사용할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon?page=1&limit=5')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeLessThanOrEqual(5);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(5);
        });

        it('검색 파라미터를 사용할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon?search=피카')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('타입 필터를 사용할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon?type=불꽃')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });

        it('정렬 옵션을 사용할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon?sortBy=name&sortOrder=ASC&limit=5')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/pokemon/:id', () => {
        it('유효한 ID로 포켓몬을 조회할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.id).toBe(1);
        });

        it('존재하지 않는 ID로 조회하면 404를 반환해야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon/-1')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });

        it('유효하지 않은 ID로 조회하면 400을 반환해야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon/invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('GET /api/pokemon/pokedex/:number', () => {
        it('유효한 도감 번호로 포켓몬을 조회할 수 있어야 한다', async () => {
            // 먼저 존재하는 도감 번호를 찾는다
            const listResponse = await request(app)
                .get('/api/pokemon?limit=1')
                .expect(200);

            const firstPokemon = listResponse.body.data[0];
            if (firstPokemon.pokedex_number) {
                const response = await request(app)
                    .get(`/api/pokemon/pokedex/${firstPokemon.pokedex_number}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toBeDefined();
                expect(response.body.data.pokedex_number).toBe(firstPokemon.pokedex_number);
            }
        });

        it('존재하지 않는 도감 번호로 조회하면 404를 반환해야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon/pokedex/999999')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('GET /api/pokemon/search/name/:name', () => {
        it('이름으로 포켓몬을 검색할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon/search/name/피카')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.count).toBeDefined();
        });

        it('존재하지 않는 이름으로 검색하면 빈 배열을 반환해야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon/search/name/존재하지않는포켓몬')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
            expect(response.body.count).toBe(0);
        });
    });

    describe('GET /api/pokemon/type/:type', () => {
        it('타입으로 포켓몬을 조회할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon/type/불꽃')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.count).toBeDefined();
        });

        it('존재하지 않는 타입으로 조회하면 빈 배열을 반환해야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon/type/NonExistentType')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
            expect(response.body.count).toBe(0);
        });
    });

    describe('GET /api/pokemon/stats/overview', () => {
        it('포켓몬 통계를 조회할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/pokemon/stats/overview')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.total).toBeGreaterThan(0);
            expect(Array.isArray(response.body.data.byType)).toBe(true);
            expect(Array.isArray(response.body.data.byCategory)).toBe(true);
        });
    });

});
