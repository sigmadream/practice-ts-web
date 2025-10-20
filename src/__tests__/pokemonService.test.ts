import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PokemonService } from '../services/pokemonService';
import { DatabaseConnection } from '../database/connection';

describe('PokemonService', () => {
    let db: DatabaseConnection;
    let pokemonService: PokemonService;

    beforeAll(async () => {
        db = new DatabaseConnection('db/pokedex.db');
        await db.connect();
        pokemonService = new PokemonService(db);
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe('getAllPokemon', () => {
        it('기본 페이지네이션으로 포켓몬 목록을 조회할 수 있어야 한다', async () => {
            const result = await pokemonService.getAllPokemon();

            expect(result).toHaveProperty('pokemon');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('page');
            expect(result).toHaveProperty('limit');
            expect(Array.isArray(result.pokemon)).toBe(true);
            expect(result.total).toBeGreaterThan(0);
        });

        it('페이지 크기를 지정할 수 있어야 한다', async () => {
            const result = await pokemonService.getAllPokemon({ limit: 5 });

            expect(result.pokemon.length).toBeLessThanOrEqual(5);
            expect(result.limit).toBe(5);
        });

        it('페이지 번호를 지정할 수 있어야 한다', async () => {
            const result = await pokemonService.getAllPokemon({ page: 2, limit: 5 });

            expect(result.page).toBe(2);
        });

        it('검색어로 포켓몬을 검색할 수 있어야 한다', async () => {
            const result = await pokemonService.getAllPokemon({ search: '피카' });

            expect(result.pokemon.length).toBeGreaterThan(0);
            result.pokemon.forEach(pokemon => {
                expect(
                    pokemon.name.includes('피카') ||
                    pokemon.description.includes('피카')
                ).toBe(true);
            });
        });

        it('타입으로 포켓몬을 필터링할 수 있어야 한다', async () => {
            const result = await pokemonService.getAllPokemon({ type: '불꽃' });

            expect(result.pokemon.length).toBeGreaterThan(0);
            result.pokemon.forEach(pokemon => {
                expect(pokemon.types).toContain('불꽃');
            });
        });

        it('정렬 옵션을 사용할 수 있어야 한다', async () => {
            const result = await pokemonService.getAllPokemon({
                sortBy: 'name',
                sortOrder: 'ASC',
                limit: 5
            });

            expect(result.pokemon.length).toBeGreaterThan(0);
            const names = result.pokemon.map(p => p.name).filter(name => name);
            const sortedNames = [...names].sort();
            expect(names).toEqual(sortedNames);
        });
    });

    describe('getPokemonById', () => {
        it('유효한 ID로 포켓몬을 조회할 수 있어야 한다', async () => {
            const pokemon = await pokemonService.getPokemonById(1);

            expect(pokemon).toBeDefined();
            expect(pokemon?.id).toBe(1);
        });

        it('존재하지 않는 ID로 조회하면 null을 반환해야 한다', async () => {
            const pokemon = await pokemonService.getPokemonById(-1);

            expect(pokemon).toBeNull();
        });
    });

    describe('getPokemonByPokedexNumber', () => {
        it('유효한 도감 번호로 포켓몬을 조회할 수 있어야 한다', async () => {
            // 먼저 존재하는 도감 번호를 찾는다
            const allPokemon = await pokemonService.getAllPokemon({ limit: 1 });
            const firstPokemon = allPokemon.pokemon[0];

            if (firstPokemon.pokedex_number) {
                const pokemon = await pokemonService.getPokemonByPokedexNumber(firstPokemon.pokedex_number);
                expect(pokemon).toBeDefined();
                expect(pokemon?.pokedex_number).toBe(firstPokemon.pokedex_number);
            }
        });

        it('존재하지 않는 도감 번호로 조회하면 null을 반환해야 한다', async () => {
            const pokemon = await pokemonService.getPokemonByPokedexNumber('999999');

            expect(pokemon).toBeNull();
        });
    });

    describe('searchPokemonByName', () => {
        it('이름으로 포켓몬을 검색할 수 있어야 한다', async () => {
            const pokemon = await pokemonService.searchPokemonByName('피카');

            expect(Array.isArray(pokemon)).toBe(true);
            pokemon.forEach(p => {
                expect(p.name).toContain('피카');
            });
        });

        it('존재하지 않는 이름으로 검색하면 빈 배열을 반환해야 한다', async () => {
            const pokemon = await pokemonService.searchPokemonByName('존재하지않는포켓몬');

            expect(pokemon).toEqual([]);
        });
    });

    describe('getPokemonByType', () => {
        it('타입으로 포켓몬을 조회할 수 있어야 한다', async () => {
            const pokemon = await pokemonService.getPokemonByType('불꽃');

            expect(Array.isArray(pokemon)).toBe(true);
            pokemon.forEach(p => {
                expect(p.types).toContain('불꽃');
            });
        });

        it('존재하지 않는 타입으로 조회하면 빈 배열을 반환해야 한다', async () => {
            const pokemon = await pokemonService.getPokemonByType('NonExistentType');

            expect(pokemon).toEqual([]);
        });
    });

    describe('getPokemonStats', () => {
        it('포켓몬 통계를 조회할 수 있어야 한다', async () => {
            const stats = await pokemonService.getPokemonStats();

            expect(stats).toHaveProperty('total');
            expect(stats).toHaveProperty('byType');
            expect(stats).toHaveProperty('byCategory');
            expect(typeof stats.total).toBe('number');
            expect(Array.isArray(stats.byType)).toBe(true);
            expect(Array.isArray(stats.byCategory)).toBe(true);
            expect(stats.total).toBeGreaterThan(0);
        });
    });

});
