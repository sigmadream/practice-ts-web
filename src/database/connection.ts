import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';

// 테스트 환경용 데이터베이스 설정
const isTest = process.env.NODE_ENV === 'test';
const databasePath = isTest ? 'db/test-pokedex.db' : 'db/pokedex.db';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: path.resolve(databasePath),
    synchronize: false, // 자동 스키마 동기화 비활성화
    logging: process.env.NODE_ENV === 'development',
    entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
    migrations: [path.join(__dirname, '../migrations/**/*.{ts,js}')],
    subscribers: [path.join(__dirname, '../subscribers/**/*.{ts,js}')],
});