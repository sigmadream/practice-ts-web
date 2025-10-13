import express, { Request, Response } from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';
import { getDatabase } from './database/connection';

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req: Request, _res: Response, next: () => void) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// 기본 라우트
app.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'Express.js 5.0 with TypeScript 서버가 실행 중입니다!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            api: '/api',
            health: '/api/health',
        },
    });
});

// 라우터 설정
app.use('/api', apiRoutes);

// 에러 핸들링 미들웨어
app.use((err: Error, _req: Request, res: Response, _next: () => void) => {
    console.error('에러 발생:', err);
    res.status(500).json({
        error: '서버 내부 오류가 발생했습니다.',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// 404 핸들러
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: '요청한 리소스를 찾을 수 없습니다.',
        path: req.originalUrl,
    });
});

// 데이터베이스 연결 및 서버 시작
async function startServer() {
    try {
        // 데이터베이스 연결
        await getDatabase().connect();

        // 서버 시작
        app.listen(PORT, () => {
            console.log(`http://localhost:${PORT} 에서 실행 중입니다.`);
        });
    } catch (error) {
        console.error('서버 시작 실패:', error);
        process.exit(1);
    }
}

// 서버 종료
process.on('SIGINT', async () => {
    console.log('\n서버를 종료합니다...');
    try {
        await getDatabase().disconnect();
        console.log('데이터베이스 연결이 해제되었습니다.');
        process.exit(0);
    } catch (error) {
        console.error('데이터베이스 연결 해제 실패:', error);
        process.exit(1);
    }
});

startServer();

export default app;
