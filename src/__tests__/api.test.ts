import request from 'supertest';
import app from '../index';

describe('API Health Endpoint', () => {
    describe('GET /api/health', () => {
        it('should return health status with correct structure', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            // status가 'OK'인지 확인
            expect(response.body.status).toBe('OK');

            // 필수 필드들이 존재하는지 확인
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('environment');
        });

        it('should return 200 status code', async () => {
            await request(app)
                .get('/api/health')
                .expect(200);
        });

        it('should have correct content type', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.headers['content-type']).toMatch(/application\/json/);
        });
    });
});