import { Router, Request, Response } from 'express';
import { PokemonService, PokemonQuery } from '../services/pokemonService';
import { getDatabase } from '../database/connection';

const router = Router();
const pokemonService = new PokemonService(getDatabase());

/**
 * @swagger
 * /api/pokemon:
 *   get:
 *     summary: 모든 포켓몬 조회
 *     description: 페이지네이션, 검색, 필터링을 지원하는 포켓몬 목록을 조회합니다.
 *     tags: [Pokemon]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 포켓몬 이름으로 검색
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 타입으로 필터링
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, name, pokedex_number]
 *         description: 정렬 기준
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: 정렬 순서
 *     responses:
 *       200:
 *         description: 포켓몬 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PokemonList'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const query: PokemonQuery = {
            page: req.query.page ? parseInt(req.query.page as string) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            search: req.query.search as string,
            type: req.query.type as string,
            sortBy: req.query.sortBy as 'id' | 'name' | 'pokedex_number',
            sortOrder: req.query.sortOrder as 'ASC' | 'DESC'
        };

        const result = await pokemonService.getAllPokemon(query);

        res.json({
            success: true,
            data: result.pokemon,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: Math.ceil(result.total / result.limit)
            }
        });
    } catch (error) {
        console.error('포켓몬 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: '포켓몬 목록을 조회하는 중 오류가 발생했습니다.'
        });
    }
});

/**
 * @swagger
 * /api/pokemon/{id}:
 *   get:
 *     summary: ID로 포켓몬 조회
 *     description: 고유 ID로 특정 포켓몬의 상세 정보를 조회합니다.
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 포켓몬 고유 ID
 *     responses:
 *       200:
 *         description: 포켓몬 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PokemonDetail'
 *       400:
 *         description: 잘못된 ID 형식
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 포켓몬을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: '유효하지 않은 ID입니다.'
            });
        }

        const pokemon = await pokemonService.getPokemonById(id);

        if (!pokemon) {
            return res.status(404).json({
                success: false,
                error: '포켓몬을 찾을 수 없습니다.'
            });
        }

        return res.json({
            success: true,
            data: pokemon
        });
    } catch (error) {
        console.error('포켓몬 조회 실패:', error);
        return res.status(500).json({
            success: false,
            error: '포켓몬을 조회하는 중 오류가 발생했습니다.'
        });
    }
});

/**
 * @swagger
 * /api/pokemon/pokedex/{number}:
 *   get:
 *     summary: 도감 번호로 포켓몬 조회
 *     description: 포켓몬 도감 번호로 특정 포켓몬의 상세 정보를 조회합니다.
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         schema:
 *           type: string
 *         description: 포켓몬 도감 번호
 *     responses:
 *       200:
 *         description: 포켓몬 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PokemonDetail'
 *       404:
 *         description: 포켓몬을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/pokedex/:number', async (req: Request, res: Response) => {
    try {
        const pokedexNumber = req.params.number;
        const pokemon = await pokemonService.getPokemonByPokedexNumber(pokedexNumber);

        if (!pokemon) {
            return res.status(404).json({
                success: false,
                error: '포켓몬을 찾을 수 없습니다.'
            });
        }

        return res.json({
            success: true,
            data: pokemon
        });
    } catch (error) {
        console.error('포켓몬 조회 실패:', error);
        return res.status(500).json({
            success: false,
            error: '포켓몬을 조회하는 중 오류가 발생했습니다.'
        });
    }
});

/**
 * @swagger
 * /api/pokemon/search/name/{name}:
 *   get:
 *     summary: 이름으로 포켓몬 검색
 *     description: 포켓몬 이름으로 검색하여 관련 포켓몬들을 조회합니다.
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색할 포켓몬 이름
 *     responses:
 *       200:
 *         description: 포켓몬 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pokemon'
 *                 count:
 *                   type: integer
 *                   example: 3
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search/name/:name', async (req: Request, res: Response) => {
    try {
        const name = req.params.name;
        const pokemon = await pokemonService.searchPokemonByName(name);

        res.json({
            success: true,
            data: pokemon,
            count: pokemon.length
        });
    } catch (error) {
        console.error('포켓몬 검색 실패:', error);
        res.status(500).json({
            success: false,
            error: '포켓몬을 검색하는 중 오류가 발생했습니다.'
        });
    }
});

/**
 * @swagger
 * /api/pokemon/type/{type}:
 *   get:
 *     summary: 타입별 포켓몬 조회
 *     description: 특정 타입의 포켓몬들을 조회합니다.
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: 포켓몬 타입 예시 - 풀, 불꽃, 물 등
 *     responses:
 *       200:
 *         description: 타입별 포켓몬 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pokemon'
 *                 count:
 *                   type: integer
 *                   example: 15
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/type/:type', async (req: Request, res: Response) => {
    try {
        const type = req.params.type;
        const pokemon = await pokemonService.getPokemonByType(type);

        res.json({
            success: true,
            data: pokemon,
            count: pokemon.length
        });
    } catch (error) {
        console.error('타입별 포켓몬 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: '타입별 포켓몬을 조회하는 중 오류가 발생했습니다.'
        });
    }
});

/**
 * @swagger
 * /api/pokemon/stats/overview:
 *   get:
 *     summary: 포켓몬 통계 조회
 *     description: 포켓몬 데이터베이스의 전체 통계 정보를 조회합니다.
 *     tags: [Pokemon]
 *     responses:
 *       200:
 *         description: 포켓몬 통계 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PokemonStats'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats/overview', async (_req: Request, res: Response) => {
    try {
        const stats = await pokemonService.getPokemonStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('포켓몬 통계 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: '포켓몬 통계를 조회하는 중 오류가 발생했습니다.'
        });
    }
});


export default router;
