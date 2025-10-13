# 포켓몬 데이터베이스 스키마

> `pokedex.db` SQLite3 데이터베이스의 스키마를 설명합니다.

## 데이터베이스 정보

- 데이터베이스 파일: `db/pokedex.db`
- 총 레코드 수: 1,205개
- 테이블 수: 1개

## 테이블 구조

### pokemon 테이블

포켓몬 정보를 저장하는 메인 테이블입니다.

#### 스키마 정의

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

| 컬럼명 | 데이터 타입 | NULL 허용 | 기본값 | 설명 |
|--------|-------------|-----------|--------|------|
| `id` | INTEGER | NO | - | 기본 키 (Primary Key) |
| `pokedex_number` | TEXT | YES | - | 포켓몬 도감 번호 |
| `name` | TEXT | YES | - | 포켓몬 이름 |
| `description` | TEXT | YES | - | 포켓몬 설명 |
| `types` | TEXT | YES | - | 포켓몬 타입 (예: Fire, Water 등) |
| `height` | REAL | YES | - | 포켓몬 키 (m 단위) |
| `category` | TEXT | YES | - | 포켓몬 카테고리 |
| `weight` | REAL | YES | - | 포켓몬 무게 (kg 단위) |
| `gender` | TEXT | YES | - | 포켓몬 성별 |
| `abilities` | TEXT | YES | - | 포켓몬 특성 |
| `image` | BLOB | YES | - | 포켓몬 이미지 데이터 |

#### 데이터 타입 설명

- INTEGER: 정수형 데이터
- TEXT: 문자열 데이터
- REAL: 실수형 데이터 (소수점 포함)
- BLOB: 바이너리 데이터 (이미지 파일 등)

#### 제약 조건

- `id` 컬럼은 PRIMARY KEY로 설정되어 있어 고유값이어야 합니다.
- 다른 컬럼들은 NULL 값을 허용합니다.

## 사용 예시

### 기본 조회
```sql
-- 모든 포켓몬 조회
SELECT * FROM pokemon;

-- 특정 포켓몬 조회
SELECT * FROM pokemon WHERE name = '피카츄';

-- 타입별 포켓몬 조회
SELECT * FROM pokemon WHERE types LIKE '%Fire%';
```

### 통계 조회

```sql
-- 총 포켓몬 수
SELECT COUNT(*) FROM pokemon;

-- 타입별 포켓몬 수
SELECT types, COUNT(*) FROM pokemon GROUP BY types;
```

## 주의사항

- `image` 컬럼은 BLOB 타입으로 이미지 데이터를 저장하므로, 대용량 데이터를 포함할 수 있음
- `types`, `abilities` 등의 컬럼은 TEXT 타입으로 저장되어 있어, 여러 값을 포함할 경우 구분자를 사용해야 함
