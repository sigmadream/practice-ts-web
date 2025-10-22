import { describe, it, expect, vi } from 'vitest';
import { PokemonService } from '../services/pokemonService';
import { Repository } from 'typeorm';
import { Pokemon } from '../entities/Pokemon';

// Mock a repository
const createMockRepository = (): Partial<Repository<Pokemon>> => ({
    findAndCount: vi.fn(),
    findOneBy: vi.fn(),
    find: vi.fn(),
    count: vi.fn(),
    createQueryBuilder: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn(),
    })),
});

describe('PokemonService', () => {
    let mockRepository: Partial<Repository<Pokemon>>;
    let pokemonService: PokemonService;

    beforeEach(() => {
        mockRepository = createMockRepository();
        pokemonService = new PokemonService(mockRepository as Repository<Pokemon>);
    });

    describe('getAllPokemon', () => {
        it('기본 페이지네이션으로 포켓몬 목록을 조회할 수 있어야 한다', async () => {
            const mockPokemon = [{ id: 1, name: 'Pikachu' }] as Pokemon[];
            const mockTotal = 1;
            (mockRepository.findAndCount as vi.Mock).mockResolvedValue([mockPokemon, mockTotal]);

            const result = await pokemonService.getAllPokemon();

            expect(result.pokemon).toEqual(mockPokemon);
            expect(result.total).toBe(mockTotal);
            expect(mockRepository.findAndCount).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    describe('getPokemonById', () => {
        it('유효한 ID로 포켓몬을 조회할 수 있어야 한다', async () => {
            const mockPokemon = { id: 1, name: 'Pikachu' } as Pokemon;
            (mockRepository.findOneBy as vi.Mock).mockResolvedValue(mockPokemon);

            const pokemon = await pokemonService.getPokemonById(1);

            expect(pokemon).toEqual(mockPokemon);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
        });

        it('존재하지 않는 ID로 조회하면 null을 반환해야 한다', async () => {
            (mockRepository.findOneBy as vi.Mock).mockResolvedValue(null);

            const pokemon = await pokemonService.getPokemonById(-1);

            expect(pokemon).toBeNull();
        });
    });

    describe('getPokemonByPokedexNumber', () => {
        it('유효한 도감 번호로 포켓몬을 조회할 수 있어야 한다', async () => {
            const mockPokemon = { id: 1, pokedex_number: '001', name: 'Bulbasaur' } as Pokemon;
            (mockRepository.findOneBy as vi.Mock).mockResolvedValue(mockPokemon);

            const pokemon = await pokemonService.getPokemonByPokedexNumber('001');

            expect(pokemon).toEqual(mockPokemon);
            expect(mockRepository.findOneBy).toHaveBeenCalledWith({ pokedex_number: '001' });
        });
    });

    describe('searchPokemonByName', () => {
        it('이름으로 포켓몬을 검색할 수 있어야 한다', async () => {
            const mockPokemon = [{ id: 1, name: 'Pikachu' }] as Pokemon[];
            (mockRepository.find as vi.Mock).mockResolvedValue(mockPokemon);

            const pokemon = await pokemonService.searchPokemonByName('Pika');

            expect(pokemon).toEqual(mockPokemon);
            expect(mockRepository.find).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    describe('getPokemonByType', () => {
        it('타입으로 포켓몬을 조회할 수 있어야 한다', async () => {
            const mockPokemon = [{ id: 1, name: 'Charmander', types: 'Fire' }] as Pokemon[];
            (mockRepository.find as vi.Mock).mockResolvedValue(mockPokemon);

            const pokemon = await pokemonService.getPokemonByType('Fire');

            expect(pokemon).toEqual(mockPokemon);
            expect(mockRepository.find).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    describe('getPokemonStats', () => {
        it('포켓몬 통계를 조회할 수 있어야 한다', async () => {
            const mockCount = 150;
            const mockPokemon = [{ types: 'Fire,Water' }, { types: 'Grass' }] as Pokemon[];
            const mockCategoryStats = [{ category: 'Seed', count: '10' }];

            (mockRepository.count as vi.Mock).mockResolvedValue(mockCount);
            (mockRepository.find as vi.Mock).mockResolvedValue(mockPokemon);
            (mockRepository.createQueryBuilder as vi.Mock).mockReturnValue({
                select: vi.fn().mockReturnThis(),
                addSelect: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                groupBy: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockReturnThis(),
                getRawMany: vi.fn().mockResolvedValue(mockCategoryStats),
            });

            const stats = await pokemonService.getPokemonStats();

            expect(stats.total).toBe(mockCount);
            expect(stats.byType).toBeDefined();
            expect(stats.byCategory).toBeDefined();
        });
    });
});