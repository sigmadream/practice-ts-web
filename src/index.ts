import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';
import webRoutes from './routes/web';
import { AppDataSource } from './database/connection';
import { setupSwagger } from './config/swagger';
import logger from './config/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// PUG 템플릿 엔진 설정
app.set('view engine', 'pug');
app.set('views', './views');

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use((req: Request, _res: Response, next: () => void) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// 기본 라우트 - PUG 템플릿으로 홈페이지 렌더링
app.get('/', (_req: Request, res: Response) => {
    res.render('index', {
        title: '포켓몬 API - 홈'
    });
});

// Swagger 설정
setupSwagger(app);

// 라우터 설정
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// 에러 핸들링 미들웨어
app.use((err: Error, _req: Request, res: Response, _next: () => void) => {
    logger.error('에러 발생:', err);
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
        await AppDataSource.initialize();
        logger.info('Data Source has been initialized!');

        // 서버 시작
        app.listen(PORT, () => {
            logger.info(`http://localhost:${PORT} 에서 실행 중입니다.`);
        });
    } catch (error) {
        logger.error('Error during Data Source initialization:', error);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
        throw error;
    }
}

// 서버 종료
process.on('SIGINT', async () => {
    logger.info('서버를 종료합니다...');
    try {
        await AppDataSource.destroy();
        logger.info('데이터베이스 연결이 해제되었습니다.');
        process.exit(0);
    } catch (error) {
        logger.error('데이터베이스 연결 해제 실패:', error);
        process.exit(1);
    }
});

// 테스트 환경이 아닐 때만 서버 시작
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export default app;
