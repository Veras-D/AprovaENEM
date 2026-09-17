# REST API Specification — AprovaENEM

> **Specification Standard**: OpenAPI 3.0 / RESTful JSON  
> **Base URL**: `http://localhost:8080/api/v1` (via API Gateway)  
> **Headers**: `X-Session-Id` (UUID), `Accept-Language` (`pt-BR` | `en`), `Authorization` (`Bearer <token>`)  

---

## 1. Global Headers & Error Standard (RFC 7807)

### Request Headers
| Header Name | Type | Requirement | Description |
| :--- | :--- | :--- | :--- |
| `X-Session-Id` | `string (UUID)` | **Recommended** | Anonymous or authenticated session identifier for attempt tracking. |
| `Accept-Language` | `string` | Optional | Locale preference (`pt-BR` default, `en` supported). |
| `Authorization` | `string` | Optional | `Bearer <JWT>` for registered student sessions. |
| `Content-Type` | `string` | Required for `POST/PUT` | `application/json` |

### Error Response Schema (RFC 7807 Problem Details)
All error responses return a standardized JSON payload:

```json
{
  "type": "https://aprovaenem.org/errors/RESOURCE_NOT_FOUND",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Question with ID '3fa85f64-5717-4562-b3fc-2c963f66afa6' does not exist.",
  "instance": "/api/v1/questions/3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "code": "QUESTION_NOT_FOUND",
  "timestamp": "2026-09-17T19:40:00Z",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

### Security Schemes & Spring Security 6 RBAC
AprovaENEM defines two primary OpenAPI security schemes enforced by Spring Security:
1. **`bearerAuth`**:
   - Type: `http`, Scheme: `bearer`, BearerFormat: `JWT`.
   - Required for account sync and profile operations (`ROLE_STUDENT`) or curriculum maintenance (`ROLE_ADMIN`).
2. **`sessionIdAuth`**:
   - Type: `apiKey`, In: `header`, Name: `X-Session-Id`.
   - Used for tracking anonymous practice sessions mapped to `ROLE_ANONYMOUS_STUDENT`.

#### Security Error Schemas (RFC 7807)
* **401 Unauthorized** (Emitted by `CustomAuthenticationEntryPoint` when JWT is missing, invalid, or expired):
  ```json
  {
    "type": "https://aprovaenem.org/errors/UNAUTHORIZED",
    "title": "Unauthorized",
    "status": 401,
    "detail": "Full authentication is required to access this resource.",
    "instance": "/api/v1/student/profile",
    "code": "UNAUTHORIZED",
    "timestamp": "2026-09-18T00:30:00Z",
    "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
  }
  ```

* **403 Forbidden** (Emitted by `CustomAccessDeniedHandler` when user lacks required role):
  ```json
  {
    "type": "https://aprovaenem.org/errors/ACCESS_DENIED",
    "title": "Access Denied",
    "status": 403,
    "detail": "Access denied: Principal does not possess 'ROLE_ADMIN'.",
    "instance": "/api/v1/admin/ingest",
    "code": "ACCESS_DENIED",
    "timestamp": "2026-09-18T00:30:00Z",
    "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
  }
  ```

---

## 2. Authentication & Session Endpoints (`auth-service`)

### 2.1 Provision Anonymous Practice Session
* **Method**: `POST`
* **Path**: `/api/v1/auth/session`
* **Description**: Instantly generates an anonymous session UUID for frictionless student practice without registration.

#### Response `201 Created`
```json
{
  "sessionId": "a8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d",
  "isAnonymous": true,
  "expiresAt": "2026-10-17T19:40:00Z",
  "message": "Anonymous session created. Pass this ID in the 'X-Session-Id' header."
}
```

---

### 2.2 Register Student Account (Optional)
* **Method**: `POST`
* **Path**: `/api/v1/auth/register`
* **Description**: Creates a registered account to persist diagnostic history across devices.

#### Request Body
```json
{
  "email": "lucas.silva@escola.ma.gov.br",
  "password": "SecurePassword123!",
  "fullName": "Lucas Silva",
  "schoolType": "PUBLIC_SCHOOL",
  "targetDegree": "Computer Science"
}
```

#### Response `201 Created`
```json
{
  "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "email": "lucas.silva@escola.ma.gov.br",
  "fullName": "Lucas Silva",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresInSeconds": 86400
}
```

---

### 2.3 Student Login
* **Method**: `POST`
* **Path**: `/api/v1/auth/login`

#### Request Body
```json
{
  "email": "lucas.silva@escola.ma.gov.br",
  "password": "SecurePassword123!"
}
```

#### Response `200 OK`
```json
{
  "userId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresInSeconds": 86400
}
```

---

## 3. Question Bank & Catalog Endpoints (`exam-service`)

### 3.1 List Exam Editions
* **Method**: `GET`
* **Path**: `/api/v1/exams`
* **Description**: Returns all historical ENEM editions ingested in the repository.

#### Response `200 OK`
```json
{
  "data": [
    {
      "id": "11111111-2222-3333-4444-555555555555",
      "year": 2023,
      "title": "ENEM 2023 - Caderno Azul (Regular)",
      "examColor": "BLUE",
      "totalQuestions": 180
    },
    {
      "id": "22222222-3333-4444-5555-666666666666",
      "year": 2022,
      "title": "ENEM 2022 - Caderno Amarelo (Regular)",
      "examColor": "YELLOW",
      "totalQuestions": 180
    }
  ]
}
```

---

### 3.2 List Subject Areas & Taxonomy
* **Method**: `GET`
* **Path**: `/api/v1/subjects`

#### Response `200 OK`
```json
{
  "data": [
    {
      "code": "NATURAL_SCIENCES",
      "name": "Ciências da Natureza e suas Tecnologias",
      "disciplines": [
        {
          "name": "Physics",
          "topics": [
            { "id": "33333333-4444-5555-6666-777777777777", "name": "Optics & Light Phenomena", "slug": "optics" },
            { "id": "44444444-5555-6666-7777-888888888888", "name": "Electrical Circuits & Ohm's Law", "slug": "circuits" }
          ]
        }
      ]
    },
    {
      "code": "MATHEMATICS",
      "name": "Matemática e suas Tecnologias",
      "disciplines": [
        {
          "name": "Mathematics",
          "topics": [
            { "id": "55555555-6666-7777-8888-999999999999", "name": "Quadratic Functions", "slug": "quadratic-functions" }
          ]
        }
      ]
    }
  ]
}
```

---

### 3.3 Query Questions with Filters
* **Method**: `GET`
* **Path**: `/api/v1/questions`
* **Query Parameters**:
  - `year` (int, optional) — e.g. `2023`
  - `subject` (string, optional) — e.g. `NATURAL_SCIENCES`
  - `topicId` (UUID, optional) — e.g. `33333333-4444-5555-6666-777777777777`
  - `difficulty` (string, optional) — `EASY` | `MEDIUM` | `HARD`
  - `page` (int, default: 0)
  - `size` (int, default: 10, max: 50)

#### Response `200 OK`
```json
{
  "content": [
    {
      "id": "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
      "year": 2023,
      "subject": "NATURAL_SCIENCES",
      "discipline": "Physics",
      "topic": "Electrical Circuits & Ohm's Law",
      "itemNumber": 105,
      "statement": "Um eletricista precisa instalar um disjuntor para proteger um circuito de chuveiro elétrico de potência $P = 5500\\text{ W}$ conectado a uma rede de $V = 220\\text{ V}$. Considerando a corrente nominal calculada por $I = P/V$, determine a corrente e selecione o disjuntor comercial adequado.",
      "difficulty": "MEDIUM",
      "options": [
        { "optionLetter": "A", "text": "Corrente de 15 A; disjuntor de 15 A." },
        { "optionLetter": "B", "text": "Corrente de 25 A; disjuntor de 30 A." },
        { "optionLetter": "C", "text": "Corrente de 35 A; disjuntor de 40 A." },
        { "optionLetter": "D", "text": "Corrente de 20 A; disjuntor de 20 A." },
        { "optionLetter": "E", "text": "Corrente de 50 A; disjuntor de 60 A." }
      ]
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 45,
  "totalPages": 5
}
```
*(Notice: The correct answer is omitted from list queries to prevent student cheating during practice).*

---

### 3.4 Get Question by ID
* **Method**: `GET`
* **Path**: `/api/v1/questions/{id}`

#### Response `200 OK`
Returns the question statement and options A–E.

---

## 4. Practice Session & Grading Endpoints (`exam-service`)

### 4.1 Start Practice Session (Generate Quiz)
* **Method**: `POST`
* **Path**: `/api/v1/sessions`
* **Headers**: `X-Session-Id` (UUID)

#### Request Body
```json
{
  "sessionType": "TOPIC_PRACTICE",
  "subject": "NATURAL_SCIENCES",
  "topicId": "33333333-4444-5555-6666-777777777777",
  "questionCount": 5
}
```

#### Response `201 Created`
```json
{
  "sessionId": "88888888-9999-aaaa-bbbb-cccccccccccc",
  "sessionType": "TOPIC_PRACTICE",
  "status": "IN_PROGRESS",
  "totalQuestions": 5,
  "questionIds": [
    "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
    "66666666-7777-8888-9999-aaaaaaaaaaaa"
  ],
  "startedAt": "2026-09-17T19:42:00Z"
}
```

---

### 4.2 Submit Answer Attempt
* **Method**: `POST`
* **Path**: `/api/v1/sessions/{sessionId}/attempts`
* **Description**: Submits the student's selected letter for a question. Immediately returns grading result, the correct answer, and the base resolution explanation.

#### Request Body
```json
{
  "questionId": "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
  "selectedOption": "B",
  "timeSpentSeconds": 145
}
```

#### Response `200 OK`
```json
{
  "attemptId": "99999999-aaaa-bbbb-cccc-dddddddddddd",
  "questionId": "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
  "selectedOption": "B",
  "correctOption": "B",
  "isCorrect": true,
  "baseExplanation": "Pela fórmula da potência elétrica, $I = P / V = 5500 / 220 = 25\\text{ A}$. O disjuntor deve ser escolhido com valor comercial imediatamente superior à corrente nominal para evitar desarmes intempestivos, logo o disjuntor de 30 A é a opção correta.",
  "keyConcepts": "Potência Elétrica, Lei de Joule, Dimensionamento de Circuitos"
}
```

---

### 4.3 Complete Session & Generate Diagnostic Summary
* **Method**: `POST`
* **Path**: `/api/v1/sessions/{sessionId}/complete`

#### Response `200 OK`
```json
{
  "sessionId": "88888888-9999-aaaa-bbbb-cccccccccccc",
  "status": "COMPLETED",
  "totalQuestions": 5,
  "correctCount": 4,
  "scorePercentage": 80.0,
  "durationSeconds": 620,
  "diagnosticRadar": {
    "NATURAL_SCIENCES": {
      "Physics": {
        "Electrical Circuits": { "accuracy": 100.0, "total": 3, "correct": 3, "status": "MASTERED" },
        "Optics": { "accuracy": 50.0, "total": 2, "correct": 1, "status": "ATTENTION_NEEDED" }
      }
    }
  },
  "recommendedAction": "Focus review on Snell's Law and Refraction Index in Optics."
}
```

---

## 5. Socratic AI Tutor Endpoints (`exam-service`)

### 5.1 Get Curated Question Resolution
* **Method**: `GET`
* **Path**: `/api/v1/questions/{id}/resolution`

#### Response `200 OK`
```json
{
  "questionId": "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
  "correctOption": "B",
  "baseExplanation": "Pela fórmula da potência elétrica, $I = P / V = 5500 / 220 = 25\\text{ A}$...",
  "distractorAnalysis": {
    "A": "Incorreta: 15 A subdimensionaria o circuito, causando desarmes contínuos.",
    "C": "Incorreta: 40 A superdimensionaria o condutor, gerando risco de sobreaquecimento.",
    "D": "Incorreta: 20 A é inferior aos 25 A exigidos pelo chuveiro.",
    "E": "Incorreta: 60 A deixaria a instalação sem proteção contra sobrecorrente."
  },
  "attribution": "INEP Official Pedagogical Matrix"
}
```

---

### 5.2 Ask Socratic AI Tutor
* **Method**: `POST`
* **Path**: `/api/v1/questions/{id}/ask`
* **Headers**:
  - `X-Session-Id`: `UUID`
  - `Accept-Language`: `pt-BR` | `en`
* **Rate Limit Policy**: Max 10 requests / minute per session.

#### Request Body
```json
{
  "studentQuery": "Why can't I just use a 25 A circuit breaker if the current is exactly 25 A?"
}
```

#### Response `200 OK`
```json
{
  "questionId": "77777777-8888-9999-aaaa-bbbbbbbbbbbb",
  "socraticResponse": "Ótima reflexão! Pense no que acontece no momento em que você liga o chuveiro ou se a tensão da rede oscilar levemente para baixo (por exemplo, 210 V em vez de 220 V). Se a corrente operacional já estiver no limite exato de disparo térmico de 25 A, pequenas oscilações normais provocariam o desarmamento indesejado do disjuntor. Na norma NBR 5410, qual é a margem de segurança recomendada para evitar esses desarmes sem comprometer a fiação?",
  "pedagogicalGoal": "Guide student to understand thermal dissipation margins in circuit breakers",
  "modelUsed": "gemini-1.5-flash",
  "isFallback": false
}
```

#### Rate Limit Exceeded Response `429 Too Many Requests`
```json
{
  "type": "https://aprovaenem.org/errors/RATE_LIMIT_EXCEEDED",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "AI tutor quota rate limit reached. Please wait before asking another question.",
  "retryAfterSeconds": 12,
  "timestamp": "2026-09-17T19:44:00Z"
}
```

---

## 6. Future Scope: AI Essay Evaluation & OCR Endpoints (`essay-service` — Phase 2 Premium)

> **Access Authorization**: Requires `ROLE_PREMIUM_STUDENT` (Bearer JWT) or active prepaid voucher.  
> **AI Engine**: Google Gemini 1.5 Pro Multimodal Vision (Handwritten Portuguese OCR + INEP 5-Competency Rubric).  

### 6.1 Upload & Transcribe Handwritten Essay Photo
* **Method**: `POST`
* **Path**: `/api/v1/essays/upload`
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Form Parameters**:
  - `file`: Handwritten essay page image (`image/jpeg`, `image/png`, PDF max 10MB).
  - `promptId`: UUID of the official essay theme.

#### Response `202 Accepted`
```json
{
  "essayId": "33333333-4444-5555-6666-777777777777",
  "status": "PROCESSING",
  "estimatedSeconds": 8,
  "message": "Handwritten essay uploaded. Vision OCR and 5-competency evaluation underway."
}
```

---

### 6.2 Get Complete Essay Diagnostic Evaluation
* **Method**: `GET`
* **Path**: `/api/v1/essays/{id}`
* **Headers**: `Authorization: Bearer <token>`

#### Response `200 OK`
```json
{
  "essayId": "33333333-4444-5555-6666-777777777777",
  "promptTheme": "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil",
  "status": "EVALUATED",
  "totalScore": 880,
  "transcribedText": "A Constituição Cidadã de 1988 assegura a todos os brasileiros o pleno exercício da cidadania...",
  "competencyScores": [
    {
      "competency": 1,
      "name": "Domínio da Norma Padrão",
      "score": 160,
      "feedback": "Excelente domínio sintático, com pequenos desvios de crase no 2º parágrafo.",
      "actionableTips": "Revise a regência do verbo 'visar' no sentido de ter por objetivo."
    },
    {
      "competency": 2,
      "name": "Compreensão do Tema e Repertório Sociocultural",
      "score": 200,
      "feedback": "Repertório legítimo e produtivo (menção ao conceito de Cidadãos de Papel de Gilberto Dimenstein)."
    },
    {
      "competency": 3,
      "name": "Defesa de Ponto de Vista e Argumentação",
      "score": 160,
      "feedback": "Projeto de texto claro e articulado, com argumentação coerente."
    },
    {
      "competency": 4,
      "name": "Mecanismos Linguísticos e Coesão",
      "score": 160,
      "feedback": "Boa variedade de conectivos interparágrafos, sem repetições viciosas."
    },
    {
      "competency": 5,
      "name": "Proposta de Intervenção",
      "score": 200,
      "feedback": "Proposta completa contemplando os 5 elementos: Ministério do Desenvolvimento (Agente), mutirões cartorários (Ação), verbas orçamentárias (Meio), erradicação do sub-registro (Efeito) e detalhamento."
    }
  ],
  "evaluatedAt": "2026-09-18T00:35:00Z"
}
```
