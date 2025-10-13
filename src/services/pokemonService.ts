import { DatabaseConnection } from '../database/connection';

export interface Pokemon {
    id: number;
    pokedex_number: string;
    name: string;
    description: string;
    types: string;
    height: number;
    category: string;
    weight: number;
    gender: string;
    abilities: string;
}

export interface PokemonQuery {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    sortBy?: 'id' | 'name' | 'pokedex_number';
    sortOrder?: 'ASC' | 'DESC';
}

export class PokemonService {
    private db: DatabaseConnection;

    constructor(database: DatabaseConnection) {
        this.db = database;
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

        // WHERE 조건 구성
        let whereConditions: string[] = [];
        let params: any[] = [];

        if (search) {
            whereConditions.push('(name LIKE ? OR description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (type) {
            whereConditions.push('types LIKE ?');
            params.push(`%${type}%`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // 전체 개수 조회
        const countSql = `SELECT COUNT(*) as total FROM pokemon ${whereClause}`;
        const countResult = await this.db.get(countSql, params);
        const total = countResult.total;

        // 데이터 조회
        const sql = `
      SELECT id, pokedex_number, name, description, types, height, category, weight, gender, abilities
      FROM pokemon 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

        const pokemon = await this.db.query(sql, [...params, limit, offset]);

        return {
            pokemon,
            total,
            page,
            limit
        };
    }

    // ID로 포켓몬 조회
    async getPokemonById(id: number): Promise<Pokemon | null> {
        const sql = `
      SELECT id, pokedex_number, name, description, types, height, category, weight, gender, abilities
      FROM pokemon 
      WHERE id = ?
    `;

        const pokemon = await this.db.get(sql, [id]);
        return pokemon || null;
    }

    // 포켓몬 도감 번호로 조회
    async getPokemonByPokedexNumber(pokedexNumber: string): Promise<Pokemon | null> {
        const sql = `
      SELECT id, pokedex_number, name, description, types, height, category, weight, gender, abilities
      FROM pokemon 
      WHERE pokedex_number = ?
    `;

        const pokemon = await this.db.get(sql, [pokedexNumber]);
        return pokemon || null;
    }

    // 이름으로 포켓몬 검색
    async searchPokemonByName(name: string): Promise<Pokemon[]> {
        const sql = `
      SELECT id, pokedex_number, name, description, types, height, category, weight, gender, abilities
      FROM pokemon 
      WHERE name LIKE ?
      ORDER BY name
    `;

        return await this.db.query(sql, [`%${name}%`]);
    }

    // 타입별 포켓몬 조회
    async getPokemonByType(type: string): Promise<Pokemon[]> {
        const sql = `
      SELECT id, pokedex_number, name, description, types, height, category, weight, gender, abilities
      FROM pokemon 
      WHERE types LIKE ?
      ORDER BY pokedex_number
    `;

        return await this.db.query(sql, [`%${type}%`]);
    }

    // 포켓몬 통계 조회
    async getPokemonStats(): Promise<{
        total: number;
        byType: Array<{ type: string; count: number }>;
        byCategory: Array<{ category: string; count: number }>;
    }> {
        // 전체 개수
        const totalResult = await this.db.get('SELECT COUNT(*) as total FROM pokemon');
        const total = totalResult.total;

        // 모든 포켓몬의 타입 데이터 가져오기
        const allPokemon = await this.db.query(`
            SELECT types 
            FROM pokemon 
            WHERE types IS NOT NULL AND types != ''
        `);

        // 타입별 통계 계산
        const typeCountMap = new Map<string, number>();

        allPokemon.forEach(pokemon => {
            if (!pokemon.types) return;

            let typesArray: string[] = [];
            const rawTypes = pokemon.types;

            if (typeof rawTypes === 'string') {
                // JSON 형태인지 확인 (e.g., ["타입1", "타입2"])
                if (rawTypes.startsWith('[') && rawTypes.endsWith(']')) {
                    try {
                        typesArray = JSON.parse(rawTypes);
                    } catch (e) {
                        // 파싱 실패 시, 쉼표로 구분된 문자열로 간주 (e.g., "타입1,타입2")
                        typesArray = rawTypes.replace(/[\[\]"]/g, '').split(',').map(t => t.trim());
                    }
                } else {
                    // 쉼표로 구분된 문자열 또는 단일 문자열
                    typesArray = rawTypes.split(',').map(t => t.trim());
                }
            } else if (Array.isArray(rawTypes)) {
                typesArray = rawTypes;
            }

            // 타입별로 카운트
            typesArray.forEach(type => {
                if (type && typeof type === 'string' && type.trim() !== '') {
                    const trimmedType = type.trim();
                    typeCountMap.set(trimmedType, (typeCountMap.get(trimmedType) || 0) + 1);
                }
            });
        });

        // Map을 배열로 변환하고 정렬
        const typeStats = Array.from(typeCountMap.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);

        // 카테고리별 통계
        const categoryStats = await this.db.query(`
      SELECT category, COUNT(*) as count 
      FROM pokemon 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category 
      ORDER BY count DESC
    `);

        return {
            total,
            byType: typeStats,
            byCategory: categoryStats
        };
    }

}

export default PokemonService;
