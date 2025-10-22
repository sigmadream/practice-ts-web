import { Repository, Like, ILike } from 'typeorm';
import { Pokemon } from '../entities/Pokemon';

export interface PokemonQuery {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    sortBy?: 'id' | 'name' | 'pokedex_number';
    sortOrder?: 'ASC' | 'DESC';
}

export class PokemonService {
    private pokemonRepository: Repository<Pokemon>;

    constructor(pokemonRepository: Repository<Pokemon>) {
        this.pokemonRepository = pokemonRepository;
    }

    // 모든 포켓몬 조회 (페이지네이션 지원)
    async getAllPokemon(query: PokemonQuery = {}): Promise<{ pokemon: Pokemon[]; total: number; page: number; limit: number }> {
        const {
            page = 1,
            limit = 20,
            search = '',
            type = '',
            sortBy = 'id',
            sortOrder = 'ASC'
        } = query;

        const offset = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.name = ILike(`%${search}%`);
        }
        if (type) {
            where.types = ILike(`%${type}%`);
        }

        const [pokemon, total] = await this.pokemonRepository.findAndCount({
            where,
            order: { [sortBy]: sortOrder },
            take: limit,
            skip: offset,
        });

        return {
            pokemon,
            total,
            page,
            limit
        };
    }

    // ID로 포켓몬 조회
    async getPokemonById(id: number): Promise<Pokemon | null> {
        return this.pokemonRepository.findOneBy({ id });
    }

    // 포켓몬 도감 번호로 조회
    async getPokemonByPokedexNumber(pokedexNumber: string): Promise<Pokemon | null> {
        return this.pokemonRepository.findOneBy({ pokedex_number: pokedexNumber });
    }

    // 이름으로 포켓몬 검색
    async searchPokemonByName(name: string): Promise<Pokemon[]> {
        return this.pokemonRepository.find({
            where: {
                name: Like(`%${name}%`)
            },
            order: {
                name: 'ASC'
            }
        });
    }

    // 타입별 포켓몬 조회
    async getPokemonByType(type: string): Promise<Pokemon[]> {
        return this.pokemonRepository.find({
            where: {
                types: Like(`%${type}%`)
            },
            order: {
                pokedex_number: 'ASC'
            }
        });
    }

    // 포켓몬 통계 조회
    async getPokemonStats(): Promise<{
        total: number;
        byType: Array<{ type: string; count: number }>;
        byCategory: Array<{ category: string; count: number }>;
    }> {
        const total = await this.pokemonRepository.count();

        const allPokemon = await this.pokemonRepository.find({
            select: ['types']
        });

        const typeCountMap = new Map<string, number>();
        allPokemon.forEach(pokemon => {
            if (!pokemon.types) return;
            // Assuming types are stored as a comma-separated string
            const types = pokemon.types.split(',').map(t => t.trim());
            types.forEach(type => {
                if (type) {
                    typeCountMap.set(type, (typeCountMap.get(type) || 0) + 1);
                }
            });
        });

        const byType = Array.from(typeCountMap.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);

        const byCategory = await this.pokemonRepository
            .createQueryBuilder('pokemon')
            .select('pokemon.category', 'category')
            .addSelect('COUNT(pokemon.id)', 'count')
            .where('pokemon.category IS NOT NULL AND pokemon.category != :empty', { empty: '' })
            .groupBy('pokemon.category')
            .orderBy('count', 'DESC')
            .getRawMany();

        return {
            total,
            byType,
            byCategory,
        };
    }
}

export default PokemonService;
