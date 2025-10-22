import { Router, Request, Response } from 'express';
import { PokemonService } from '../services/pokemonService';
import { getDatabase } from '../database/connection';

const router = Router();
const pokemonService = new PokemonService(getDatabase());

// 홈페이지
router.get('/', (_req: Request, res: Response) => {
    res.render('index', {
        title: '포켓몬 API - 홈'
    });
});

// 포켓몬 목록 페이지
router.get('/pokemon', async (req: Request, res: Response) => {
    try {
        const query = {
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
            search: req.query.search as string,
            type: req.query.type as string,
            sortBy: req.query.sortBy as 'id' | 'name' | 'pokedex_number',
            sortOrder: req.query.sortOrder as 'ASC' | 'DESC'
        };

        const result = await pokemonService.getAllPokemon(query);

        res.render('pokemon', {
            title: '포켓몬 목록',
            pokemon: result.pokemon,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: Math.ceil(result.total / result.limit)
            },
            query: query
        });
    } catch (error) {
        console.error('포켓몬 목록 조회 실패:', error);
        res.status(500).render('error', {
            title: '서버 오류',
            error: '포켓몬 목록을 불러오는 중 오류가 발생했습니다.'
        });
    }
});

// 통계 페이지 (특정 경로를 먼저 정의)
router.get('/pokemon/stats', async (req: Request, res: Response) => {
    try {
        const stats = await pokemonService.getPokemonStats();

        res.render('stats', {
            title: '포켓몬 통계',
            stats: stats
        });
    } catch (error) {
        console.error('통계 데이터 조회 실패:', error);
        res.status(500).render('error', {
            title: '서버 오류',
            error: '통계 데이터를 불러오는 중 오류가 발생했습니다.'
        });
    }
});


// 시스템 상태 페이지
router.get('/health', (_req: Request, res: Response) => {
    const uptime = process.uptime();
    const timestamp = new Date().toISOString();
    const environment = process.env.NODE_ENV || 'development';

    res.render('health', {
        title: '시스템 상태',
        status: 'OK',
        uptime: uptime,
        timestamp: timestamp,
        environment: environment
    });
});

// 포켓몬 상세 페이지 (동적 경로는 나중에 정의)
router.get('/pokemon/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).render('error', {
                title: '오류',
                error: '유효하지 않은 ID입니다.'
            });
        }

        const pokemon = await pokemonService.getPokemonById(id);

        if (!pokemon) {
            return res.status(404).render('error', {
                title: '포켓몬을 찾을 수 없습니다',
                error: '요청한 포켓몬을 찾을 수 없습니다.'
            });
        }

        res.render('pokemon-detail', {
            title: `${pokemon.name} - 포켓몬 상세`,
            pokemon: pokemon
        });
    } catch (error) {
        console.error('포켓몬 상세 조회 실패:', error);
        res.status(500).render('error', {
            title: '서버 오류',
            error: '포켓몬 정보를 불러오는 중 오류가 발생했습니다.'
        });
    }
});

// 검색 결과 페이지 (이름으로 검색)
router.get('/pokemon/search/name/:name', async (req: Request, res: Response) => {
    try {
        const name = req.params.name;
        const pokemonList = await pokemonService.searchPokemonByName(name);

        res.render('pokemon', {
            title: `"${name}" 검색 결과`,
            searchQuery: name,
            pokemon: pokemonList,
            query: {
                search: name,
                type: '',
                sortBy: 'id',
                sortOrder: 'ASC',
                limit: 20
            }
        });
    } catch (error) {
        console.error('포켓몬 검색 실패:', error);
        res.status(500).render('error', {
            title: '검색 오류',
            error: '포켓몬 검색 중 오류가 발생했습니다.'
        });
    }
});

// 타입별 포켓몬 페이지
router.get('/pokemon/type/:type', async (req: Request, res: Response) => {
    try {
        const type = req.params.type;
        const pokemonList = await pokemonService.getPokemonByType(type);

        res.render('pokemon', {
            title: `${type} 타입 포켓몬`,
            typeFilter: type,
            pokemon: pokemonList,
            query: {
                search: '',
                type: type,
                sortBy: 'id',
                sortOrder: 'ASC',
                limit: 20
            }
        });
    } catch (error) {
        console.error('타입별 포켓몬 조회 실패:', error);
        res.status(500).render('error', {
            title: '조회 오류',
            error: '타입별 포켓몬 조회 중 오류가 발생했습니다.'
        });
    }
});

export default router;
