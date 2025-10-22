import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: '포켓몬 API',
            version: '1.0.0',
            description: 'TypeScript 기반 Express.js 5.0 포켓몬 API 서버',
            contact: {
                name: 'Sangkon Han',
                email: 'sigmadream@gmail.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: '개발 서버',
            },
        ],
        components: {
            schemas: {
                Pokemon: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: '포켓몬 고유 ID',
                            example: 1,
                        },
                        pokedex_number: {
                            type: 'string',
                            description: '포켓몬 도감 번호',
                            example: '001',
                        },
                        name: {
                            type: 'string',
                            description: '포켓몬 이름',
                            example: '이상해씨',
                        },
                        type1: {
                            type: 'string',
                            description: '1차 타입',
                            example: '풀',
                        },
                        type2: {
                            type: 'string',
                            description: '2차 타입',
                            example: '독',
                        },
                        total: {
                            type: 'integer',
                            description: '총 능력치',
                            example: 318,
                        },
                        hp: {
                            type: 'integer',
                            description: 'HP',
                            example: 45,
                        },
                        attack: {
                            type: 'integer',
                            description: '공격력',
                            example: 49,
                        },
                        defense: {
                            type: 'integer',
                            description: '방어력',
                            example: 49,
                        },
                        sp_attack: {
                            type: 'integer',
                            description: '특수공격력',
                            example: 65,
                        },
                        sp_defense: {
                            type: 'integer',
                            description: '특수방어력',
                            example: 65,
                        },
                        speed: {
                            type: 'integer',
                            description: '속도',
                            example: 45,
                        },
                        generation: {
                            type: 'integer',
                            description: '세대',
                            example: 1,
                        },
                        legendary: {
                            type: 'boolean',
                            description: '전설 여부',
                            example: false,
                        },
                    },
                },
                PokemonList: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Pokemon',
                            },
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                page: {
                                    type: 'integer',
                                    example: 1,
                                },
                                limit: {
                                    type: 'integer',
                                    example: 20,
                                },
                                total: {
                                    type: 'integer',
                                    example: 151,
                                },
                                totalPages: {
                                    type: 'integer',
                                    example: 8,
                                },
                            },
                        },
                    },
                },
                PokemonDetail: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            $ref: '#/components/schemas/Pokemon',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        error: {
                            type: 'string',
                            example: '에러 메시지',
                        },
                    },
                },
                HealthCheck: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'OK',
                        },
                        uptime: {
                            type: 'number',
                            example: 123.456,
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-01T00:00:00.000Z',
                        },
                        environment: {
                            type: 'string',
                            example: 'development',
                        },
                    },
                },
                ApiInfo: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Express.js 5.0 TypeScript API',
                        },
                        version: {
                            type: 'string',
                            example: '1.0.0',
                        },
                        description: {
                            type: 'string',
                            example: 'TypeScript 기반 Express.js 5.0 API 서버',
                        },
                        endpoints: {
                            type: 'object',
                            properties: {
                                health: {
                                    type: 'string',
                                    example: '/api/health',
                                },
                                info: {
                                    type: 'string',
                                    example: '/api/info',
                                },
                                pokemon: {
                                    type: 'string',
                                    example: '/api/pokemon',
                                },
                            },
                        },
                    },
                },
                PokemonStats: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true,
                        },
                        data: {
                            type: 'object',
                            properties: {
                                total: {
                                    type: 'integer',
                                    example: 151,
                                },
                                byType: {
                                    type: 'object',
                                    additionalProperties: {
                                        type: 'integer',
                                    },
                                },
                                byGeneration: {
                                    type: 'object',
                                    additionalProperties: {
                                        type: 'integer',
                                    },
                                },
                                legendary: {
                                    type: 'integer',
                                    example: 15,
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], // API 문서를 생성할 파일 경로
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: '포켓몬 API 문서',
    }));
};

export default specs;
