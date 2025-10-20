import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import { getDatabase } from '../database/connection';

describe('Integration Tests', () => {
    beforeAll(async () => {
        // 데이터베이스 연결
        await getDatabase().connect();
    });

    afterAll(async () => {
        // 데이터베이스 연결 해제
        await getDatabase().disconnect();
    });

    describe('전체 API 워크플로우', () => {
        it('헬스 체크가 정상적으로 작동해야 한다', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body.status).toBe('OK');
            expect(response.body.uptime).toBeDefined();
            expect(response.body.timestamp).toBeDefined();
        });

        it('API 정보를 조회할 수 있어야 한다', async () => {
            const response = await request(app)
                .get('/api/info')
                .expect(200);

            expect(response.body.name).toBeDefined();
            expect(response.body.version).toBeDefined();
            expect(response.body.endpoints).toBeDefined();
            expect(response.body.endpoints.pokemon).toBe('/api/pokemon');
        });

        it('포켓몬 API의 전체 워크플로우가 정상적으로 작동해야 한다', async () => {
            // 1. 포켓몬 목록 조회
            const listResponse = await request(app)
                .get('/api/pokemon?limit=5')
                .expect(200);

            expect(listResponse.body.success).toBe(true);
            expect(listResponse.body.data.length).toBeGreaterThan(0);

            // 2. 첫 번째 포켓몬 상세 조회
            const firstPokemon = listResponse.body.data[0];
            const detailResponse = await request(app)
                .get(`/api/pokemon/${firstPokemon.id}`)
                .expect(200);

            expect(detailResponse.body.success).toBe(true);
            expect(detailResponse.body.data.id).toBe(firstPokemon.id);

            // 3. 포켓몬 통계 조회
            const statsResponse = await request(app)
                .get('/api/pokemon/stats/overview')
                .expect(200);

            expect(statsResponse.body.success).toBe(true);
            expect(statsResponse.body.data.total).toBeGreaterThan(0);
        });
    });


    describe('검색 및 필터링 워크플로우', () => {
        it('검색, 필터링, 정렬이 정상적으로 작동해야 한다', async () => {
            // 1. 기본 목록 조회
            const basicListResponse = await request(app)
                .get('/api/pokemon?limit=10')
                .expect(200);

            expect(basicListResponse.body.success).toBe(true);
            expect(basicListResponse.body.data.length).toBeGreaterThan(0);

            // 2. 이름으로 검색
            const searchResponse = await request(app)
                .get('/api/pokemon/search/name/피카')
                .expect(200);

            expect(searchResponse.body.success).toBe(true);
            expect(Array.isArray(searchResponse.body.data)).toBe(true);

            // 3. 타입별 필터링
            const typeFilterResponse = await request(app)
                .get('/api/pokemon/type/Fire')
                .expect(200);

            expect(typeFilterResponse.body.success).toBe(true);
            expect(Array.isArray(typeFilterResponse.body.data)).toBe(true);

            // 4. 정렬된 목록 조회
            const sortedResponse = await request(app)
                .get('/api/pokemon?sortBy=name&sortOrder=ASC&limit=5')
                .expect(200);

            expect(sortedResponse.body.success).toBe(true);
            expect(sortedResponse.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('에러 핸들링', () => {
        it('존재하지 않는 엔드포인트에 대한 404 응답이 정상적으로 작동해야 한다', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body.error).toBeDefined();
        });

        it('잘못된 요청에 대한 적절한 에러 응답이 정상적으로 작동해야 한다', async () => {
            // 유효하지 않은 ID
            const response = await request(app)
                .get('/api/pokemon/invalid')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });
    });

    describe('성능 테스트', () => {
        it('대량의 데이터 조회가 적절한 시간 내에 완료되어야 한다', async () => {
            const startTime = Date.now();

            const response = await request(app)
                .get('/api/pokemon?limit=100')
                .expect(200);

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(response.body.success).toBe(true);
            expect(duration).toBeLessThan(5000); // 5초 이내
        });

        it('통계 조회가 적절한 시간 내에 완료되어야 한다', async () => {
            const startTime = Date.now();

            const response = await request(app)
                .get('/api/pokemon/stats/overview')
                .expect(200);

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(response.body.success).toBe(true);
            expect(duration).toBeLessThan(3000); // 3초 이내
        });
    });
});
