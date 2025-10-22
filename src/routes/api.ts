// src/routes/api.ts

import { Router, Request, Response } from 'express';
import pokemonRoutes from './pokemon';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: 헬스 체크
 *     description: 서버 상태를 확인합니다.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: 서버가 정상 작동 중
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @swagger
 * /api/info:
 *   get:
 *     summary: API 정보
 *     description: API 서버의 기본 정보를 반환합니다.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiInfo'
 */
router.get('/info', (_req: Request, res: Response) => {
  res.json({
    name: 'Express.js 5.0 TypeScript API',
    version: '1.0.0',
    description: 'TypeScript 기반 Express.js 5.0 API 서버',
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      pokemon: '/api/pokemon',
    },
  });
});

// 포켓몬 라우트
router.use('/pokemon', pokemonRoutes);

export default router;
