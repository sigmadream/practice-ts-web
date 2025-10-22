import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('Simple Integration Tests', () => {
    describe('Health Check', () => {
        it('헬스 체크가 정상적으로 작동해야 한다', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body.status).toBe('OK');
            expect(response.body.uptime).toBeDefined();
            expect(response.body.timestamp).toBeDefined();
        });
    });

    describe('Error Handling', () => {
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
});
