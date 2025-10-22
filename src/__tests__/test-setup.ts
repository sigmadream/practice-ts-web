import 'reflect-metadata';
import { AppDataSource } from '../database/connection';
import { Pokemon } from '../entities/Pokemon';
import fs from 'fs';
import path from 'path';

// TypeORM Entity 메타데이터를 강제로 로드
import '../entities/Pokemon';

export async function setupTestDatabase() {
    // 테스트 데이터베이스 파일이 존재하면 삭제
    const testDbPath = path.resolve('db/test-pokedex.db');
    if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
    }

    // 데이터베이스 연결
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    // 테스트용 데이터 삽입
    const pokemonRepository = AppDataSource.getRepository(Pokemon);

    // 기존 데이터 삭제
    await pokemonRepository.clear();

    // 테스트용 데이터 삽입
    const testPokemon = [
        {
            pokedex_number: '001',
            name: '이상해씨',
            description: '태어나서부터 얼마 동안은 등의 씨앗으로부터 영양을 공급받아 크게 성장한다.',
            types: '풀,독',
            height: 0.7,
            category: '씨앗',
            weight: 6.9,
            gender: '수컷,암컷',
            abilities: '심록,엽록소'
        },
        {
            pokedex_number: '002',
            name: '이상해풀',
            description: '등의 꽃봉오리가 무겁고 걸을 때마다 흔들린다.',
            types: '풀,독',
            height: 1.0,
            category: '씨앗',
            weight: 13.0,
            gender: '수컷,암컷',
            abilities: '심록,엽록소'
        },
        {
            pokedex_number: '004',
            name: '파이리',
            description: '꼬리의 불꽃이 꺼지면 생명이 다한다고 전해진다.',
            types: '불꽃',
            height: 0.6,
            category: '도롱뇽',
            weight: 8.5,
            gender: '수컷,암컷',
            abilities: '맹화,번개'
        }
    ];

    await pokemonRepository.save(testPokemon);
}

export async function cleanupTestDatabase() {
    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }

    // 테스트 데이터베이스 파일 삭제
    const testDbPath = path.resolve('db/test-pokedex.db');
    if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
    }
}
