import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./src/__tests__/test-setup.ts'],
        testTimeout: 10000,
        pool: 'forks', // 각 테스트를 별도 프로세스에서 실행
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});