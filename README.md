# 포켓몬 API 서버

TypeScript 기반 Express.js 5.0 포켓몬 API 서버입니다. SQLite3 데이터베이스를 사용하여 포켓몬 데이터를 관리하고, Swagger UI를 통해 API 문서를 제공합니다.

## 📋 목차

- [기능](#-기능)
- [기술 스택](#-기술-스택)
- [설치 및 실행](#-설치-및-실행)
- [API 문서](#-api-문서)
- [데이터베이스 스키마](#-데이터베이스-스키마)
- [API 엔드포인트](#-api-엔드포인트)
- [개발](#-개발)
- [라이선스](#-라이선스)

## 🚀 기능

- 포켓몬 데이터 관리: 1,205개의 포켓몬 데이터를 SQLite3로 관리
- RESTful API: 포켓몬 조회, 검색, 필터링, 통계 API 제공
- 페이지네이션: 대용량 데이터 처리를 위한 페이지네이션 지원
- 검색 및 필터링: 이름, 타입별 검색 및 필터링 기능
- Swagger UI: 인터랙티브 API 문서 제공
- 웹 인터페이스: Pug 템플릿을 사용한 웹 페이지 제공
- 테스트: Vitest를 사용한 단위 테스트 및 통합 테스트

## 🛠 기술 스택

### Backend

- Node.js (>=22.0)
- Express.js 5.1.0
- TypeScript 5.9.2
- SQLite3 5.1.7

### Frontend

- Pug 3.0.2 (템플릿 엔진)

### API 문서화

- Swagger UI 5.0.1
- swagger-jsdoc 6.2.8

### 개발 도구

- Vitest 3.2.4 (테스트 프레임워크)
- tsx 4.20.6 (TypeScript 실행기)
- Prettier 3.6.0 (코드 포맷터)

## 설치 및 실행

### 1. 저장소 클론

```bash
git clone <repository-url>
cd practice-ts-web
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp env.example .env
```

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 프로덕션 빌드 및 실행

```bash
npm run build
npm start
```

## 📚 API 문서

### Swagger UI 접속

- 개발 서버: <http://localhost:3000/docs>
- API 엔드포인트: <http://localhost:3000/api>

### 웹 인터페이스

- 홈페이지: <http://localhost:3000>
- API 문서: <http://localhost:3000/docs>

## 데이터베이스 스키마

### 데이터베이스 정보

- 파일: `db/pokedex.db`
- 총 레코드 수: 1,205개
- 테이블 수: 1개

### pokemon 테이블 구조

```sql
CREATE TABLE pokemon (
    id INTEGER PRIMARY KEY,
    pokedex_number TEXT,
    name TEXT,
    description TEXT,
    types TEXT,
    height REAL,
    category TEXT,
    weight REAL,
    gender TEXT,
    abilities TEXT,
    image BLOB
);
```

#### 컬럼 상세 정보

| 컬럼명 | 데이터 타입 | 설명 |
|--------|-------------|------|
| `id` | INTEGER | 기본 키 (Primary Key) |
| `pokedex_number` | TEXT | 포켓몬 도감 번호 |
| `name` | TEXT | 포켓몬 이름 |
| `description` | TEXT | 포켓몬 설명 |
| `types` | TEXT | 포켓몬 타입 (예: Fire, Water 등) |
| `height` | REAL | 포켓몬 키 (m 단위) |
| `category` | TEXT | 포켓몬 카테고리 |
| `weight` | REAL | 포켓몬 무게 (kg 단위) |
| `gender` | TEXT | 포켓몬 성별 |
| `abilities` | TEXT | 포켓몬 특성 |
| `image` | BLOB | 포켓몬 이미지 데이터 |

## API 엔드포인트

### 시스템 API

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| `GET` | `/api/health` | 서버 상태 확인 |
| `GET` | `/api/info` | API 정보 조회 |

### 포켓몬 API

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| `GET` | `/api/pokemon` | 모든 포켓몬 조회 (페이지네이션, 검색, 필터링 지원) |
| `GET` | `/api/pokemon/{id}` | ID로 포켓몬 조회 |
| `GET` | `/api/pokemon/pokedex/{number}` | 도감 번호로 포켓몬 조회 |
| `GET` | `/api/pokemon/search/name/{name}` | 이름으로 포켓몬 검색 |
| `GET` | `/api/pokemon/type/{type}` | 타입별 포켓몬 조회 |
| `GET` | `/api/pokemon/stats/overview` | 포켓몬 통계 조회 |

### 쿼리 파라미터 (GET /api/pokemon)

| 파라미터 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| `page` | integer | 페이지 번호 | `?page=1` |
| `limit` | integer | 페이지당 항목 수 | `?limit=20` |
| `search` | string | 포켓몬 이름으로 검색 | `?search=피카츄` |
| `type` | string | 타입으로 필터링 | `?type=Fire` |
| `sortBy` | string | 정렬 기준 (id, name, pokedex_number) | `?sortBy=name` |
| `sortOrder` | string | 정렬 순서 (ASC, DESC) | `?sortOrder=ASC` |

### 응답 형식

#### 성공 응답

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1205,
    "totalPages": 61
  }
}
```

#### 에러 응답

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 개발

### 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start

# 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch

# 테스트 커버리지
npm run test:coverage

# 테스트 UI
npm run test:ui
```

### 프로젝트 구조

```
src/
├── config/
│   └── swagger.ts          # Swagger 설정
├── database/
│   └── connection.ts       # 데이터베이스 연결
├── routes/
│   ├── api.ts              # API 라우트
│   ├── pokemon.ts          # 포켓몬 라우트
│   └── web.ts              # 웹 라우트
├── services/
│   └── pokemonService.ts   # 포켓몬 서비스
├── __tests__/              # 테스트 파일들
└── index.ts                # 메인 애플리케이션
```

### 테스트

```bash
# 모든 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test pokemonService.test.ts

# 커버리지 리포트 생성
npm run test:coverage
```

## 📄 라이선스

MIT License

## 👨‍💻 작성자

Sangkon Han - <sigmadream@gmail.com>

---
