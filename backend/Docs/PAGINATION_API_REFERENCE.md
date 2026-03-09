# DevFlow API — Pagination Reference

> **Date:** March 9, 2026
> All list/collection endpoints now return a **consistent pagination envelope**.

---

## Pagination Response Shape

Every paginated endpoint returns:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 57,
    "totalPages": 3
  }
}
```

| Field        | Type    | Description                          |
| ------------ | ------- | ------------------------------------ |
| `page`       | integer | Current page (1-based)               |
| `limit`      | integer | Items per page                       |
| `total`      | integer | Total matching records               |
| `totalPages` | integer | `Math.ceil(total / limit)`           |

---

## Query Parameters (common to all paginated endpoints)

| Param   | Type    | Default | Max  | Description          |
| ------- | ------- | ------- | ---- | -------------------- |
| `page`  | integer | 1       | —    | Page number (≥ 1)    |
| `limit` | integer | varies  | 100  | Items per page (≥ 1) |

---

## List of All Paginated APIs

### 1. Repositories

| | |
|---|---|
| **Endpoint** | `GET /api/repositories` |
| **Default limit** | 20 |
| **Extra filters** | `group`, `search` |
| **Pagination status** | ✅ Already had pagination |

---

### 2. Issues

| | |
|---|---|
| **Endpoint** | `GET /api/issues` |
| **Default limit** | 20 |
| **Extra filters** | `state`, `priority`, `label`, `repository`, `assignee`, `search`, `category`, `milestone`, `sort`, `order` |
| **Pagination status** | ✅ Already had pagination |

---

### 3. Issue Comments

| | |
|---|---|
| **Endpoint** | `GET /api/issues/:id/comments` |
| **Default limit** | 50 |
| **Extra filters** | — |
| **Pagination status** | ✅ Already had pagination |

---

### 4. Labels

| | |
|---|---|
| **Endpoint** | `GET /api/labels` |
| **Default limit** | 50 (param: `pageSize`) |
| **Extra filters** | `repositoryId`, `search`, `sortBy`, `sortOrder` |
| **Pagination status** | ✅ Already had pagination |

> Note: Labels use `pageSize` instead of `limit`.

---

### 5. Categories ⭐ *Updated*

| | |
|---|---|
| **Endpoint** | `GET /api/categories` |
| **Default limit** | 20 |
| **Extra filters** | — |
| **Pagination status** | ⭐ **Pagination added** |

**What changed:**
- `category.service.ts` → `getCategories()` now accepts `page` and `limit`, uses `skip`/`take` and returns `{ data, pagination }`.
- `category.controller.ts` → Reads `page` and `limit` from query string.
- `category.routes.ts` → Added `express-validator` query validation for `page` and `limit`.
- Swagger docs updated with new parameters and pagination response.

---

### 6. Saved Views ⭐ *Updated*

| | |
|---|---|
| **Endpoint** | `GET /api/views` |
| **Default limit** | 20 |
| **Extra filters** | — |
| **Pagination status** | ⭐ **Pagination added** |

**What changed:**
- `views.service.ts` → `getViews()` now accepts `page` and `limit`, returns `{ data, pagination }`.
- `views.controller.ts` → Reads `page` and `limit` from query string.
- `views.routes.ts` → Added route-level `express-validator` query validation.
- Swagger docs updated with new parameters and pagination response.

---

### 7. Notifications

| | |
|---|---|
| **Endpoint** | `GET /api/notifications` |
| **Default limit** | 20 |
| **Extra filters** | `isRead`, `type` |
| **Pagination status** | ✅ Already had pagination |

---

### 8. Milestones

| | |
|---|---|
| **Endpoint** | `GET /api/milestones` |
| **Default limit** | 20 |
| **Extra filters** | `repositoryId`, `state` |
| **Pagination status** | ✅ Already had pagination |

---

### 9. Activity Log

| | |
|---|---|
| **Endpoint** | `GET /api/activity-log` |
| **Default limit** | 20 |
| **Extra filters** | — |
| **Pagination status** | ✅ Already had pagination |

---

### 10. Teams

| | |
|---|---|
| **Endpoint** | `GET /api/teams` |
| **Default limit** | 20 |
| **Extra filters** | — |
| **Pagination status** | ✅ Already had pagination |

---

### 11. Global Search ⭐ *Updated*

| | |
|---|---|
| **Endpoint** | `GET /api/search` |
| **Default limit** | 10 |
| **Extra filters** | `q` (required) |
| **Pagination status** | ⭐ **Pagination added** |

**What changed:**
- `additional.service.ts` → `globalSearch()` now accepts `page` and `limit`, runs `count` queries, and returns a `pagination` object.
- `additional.controller.ts` → Reads `page` from query string.
- `additional.routes.ts` → Added `page` validation.
- `additional.model.ts` → `SearchResult` interface now includes `pagination`.
- Swagger docs updated with new `page` parameter and pagination in response.

---

### Analytics Endpoints (no pagination — aggregate data)

These endpoints return summary/aggregate objects, not collections of items, so pagination does not apply:

| Endpoint | Returns |
|---|---|
| `GET /api/analytics/dashboard` | Single summary object |
| `GET /api/analytics/issues-by-status` | Grouped counts |
| `GET /api/analytics/issues-by-repo` | Grouped counts per repo |
| `GET /api/analytics/issues-over-time` | Timeline array |
| `GET /api/analytics/assignee-workload` | Workload per assignee |
| `GET /api/analytics/completion-rate` | Rate statistics |

---

## Files Modified

| File | Change |
|---|---|
| `src/services/category.service.ts` | Added `page`/`limit` params, `skip`/`take`, count query, pagination envelope |
| `src/controllers/category.controller.ts` | Parse `page`/`limit` from query, spread result, updated Swagger |
| `src/routes/category.routes.ts` | Added `query` import, validation for `page`/`limit` |
| `src/services/views.service.ts` | Added `page`/`limit` params, `skip`/`take`, count query, pagination envelope |
| `src/controllers/views.controller.ts` | Parse `page`/`limit` from query, spread result, updated Swagger |
| `src/routes/views.routes.ts` | Added `query`/`validate` imports, validation for `page`/`limit` |
| `src/services/additional.service.ts` | `globalSearch` → added `page` param, `skip`, count queries, pagination object |
| `src/controllers/additional.controller.ts` | Parse `page` from query for search, updated Swagger |
| `src/routes/additional.routes.ts` | Added `page` validation to `/search` route |
| `src/models/additional.model.ts` | `SearchResult` interface → added `pagination` field |
