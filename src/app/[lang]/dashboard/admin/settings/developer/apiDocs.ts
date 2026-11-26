/**
 * Single source for the in-app API documentation. Everything here mirrors the real implementation in
 * cyberspace-backend/src/app/modules/externalApi (routes, Zod schemas, error codes). Update both together.
 */

export interface Field {
  name: string;
  type: string;
  required: boolean | string; // true | false | "when …"
  description: string;
  example: string;
}

export interface RequestExample {
  label: string;
  note?: string;
  /** Concrete path (with query string) relative to the base URL. */
  path: string;
  body?: unknown;
  /** Send the optional Idempotency-Key header in this sample. */
  idempotency?: boolean;
  /** Only when this example's response differs from the endpoint's main one. */
  response?: unknown;
}

export interface ApiErrorDoc {
  status: number;
  code: string;
  when: string;
  /** The `message` the server really returns. */
  message: string;
  /** Field-level `error[]` entries (validation failures only). */
  details?: { path: string; message: string }[];
}

export interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string; // relative to the base URL, e.g. /categories/{id}
  title: string;
  permission: string;
  summary: string;
  pathParams?: Field[];
  queryParams?: Field[];
  bodyFields?: Field[];
  examples: RequestExample[];
  status: number;
  response: unknown;
  errors: ApiErrorDoc[];
}

export const GROUPS = [
  { id: "categories", title: "Categories" },
  { id: "products", title: "Products" },
] as const;

export function errorBody(e: ApiErrorDoc) {
  return {
    statusCode: e.status,
    success: false,
    message: e.message,
    code: e.code,
    error: e.details ?? [{ path: "", message: e.message }],
  };
}

const err = (status: number, code: string, when: string, message: string): ApiErrorDoc => ({ status, code, when, message });

const invalid = (when: string, path: string, message: string): ApiErrorDoc => ({
  status: 400,
  code: "VALIDATION_ERROR",
  when,
  message: "Request validation failed",
  details: [{ path, message }],
});

// ------------------------------------------------------------- shared errors

const AUTH_ERRORS: ApiErrorDoc[] = [
  err(401, "MISSING_API_KEY", "No API key header was sent.", "Missing API key. Send it in the X-API-Key header."),
  err(401, "INVALID_API_KEY", "The key is malformed, unknown or deleted.", "Invalid API key."),
  err(401, "API_KEY_REVOKED", "The key was revoked in Settings.", "This API key has been revoked."),
  err(401, "API_KEY_EXPIRED", "The key passed its expiration date.", "This API key has expired."),
  err(401, "API_KEY_OWNER_INACTIVE", "The admin who issued the key was deactivated or demoted.", "The administrator who issued this key is no longer active."),
  err(403, "IP_NOT_ALLOWED", "The caller IP is not on the key’s allow-list.", "Requests from this IP address are not allowed for this API key."),
  err(429, "RATE_LIMITED", "Rate limit exceeded. Wait for the number of seconds in Retry-After.", "Too many requests. Slow down and retry later."),
];

const BODY_ERRORS: ApiErrorDoc[] = [
  err(400, "INVALID_JSON", "The body is not valid JSON.", "Request body is not valid JSON"),
  err(400, "INVALID_BODY", "The body is missing, is an array, or Content-Type is not application/json.", "Request body must be a JSON object (Content-Type: application/json)."),
  err(413, "PAYLOAD_TOO_LARGE", "The body is larger than 256 KB.", "Request body exceeds 256 KB"),
  err(415, "UNSUPPORTED_ENCODING", "Unsupported charset or Content-Encoding.", "Unsupported charset or content encoding"),
];

const IDEMPOTENCY_ERRORS: ApiErrorDoc[] = [
  err(400, "INVALID_IDEMPOTENCY_KEY", "The Idempotency-Key header has a wrong format.", 'Idempotency-Key must be 1-128 characters: letters, digits, "_", ".", ":" or "-".'),
  err(422, "IDEMPOTENCY_KEY_REUSED", "Same Idempotency-Key, different request.", "This Idempotency-Key was already used with a different request."),
];

const permissionError = (permission: string) =>
  err(403, "INSUFFICIENT_PERMISSIONS", `The key does not have ${permission}.`, `This API key lacks the "${permission}" permission.`);

/** Appends the errors every endpoint of this kind can return. */
const withCommon = (method: Endpoint["method"], permission: string, own: ApiErrorDoc[]): ApiErrorDoc[] => [
  ...own,
  ...(method === "POST" || method === "PATCH" ? BODY_ERRORS : []),
  ...(method === "POST" ? IDEMPOTENCY_ERRORS : []),
  permissionError(permission),
  ...AUTH_ERRORS,
];

// ------------------------------------------------------------------ headers

export function headerFields(method: Endpoint["method"]): Field[] {
  const fields: Field[] = [
    { name: "X-API-Key", type: "string", required: true, description: "Your API key. Authorization: Bearer <key> works as an alternative.", example: "cs_live_…" },
  ];
  if (method === "POST" || method === "PATCH") {
    fields.push({ name: "Content-Type", type: "string", required: true, description: "The body must be JSON.", example: "application/json" });
  }
  if (method === "POST") {
    fields.push({
      name: "Idempotency-Key",
      type: "string (1–128: A-Z a-z 0-9 _ . : -)",
      required: false,
      description: "Makes a retry safe: the same key and body return the first response again for 24 h instead of creating a duplicate.",
      example: "erp-import-2026-11-26-0001",
    });
  }
  return fields;
}

// ------------------------------------------------------------------ samples data

const TIME = "2026-11-25T09:30:12.431Z";
const PRODUCT_ID = "9f1c6a52-3b0e-4d57-8a3c-2f6f1b6d9a10";

const rootCategory = {
  id: 12,
  slug: "laptops",
  parentId: null,
  nameAZ: "Noutbuklar",
  nameEN: "Laptops",
  nameRU: "Ноутбуки",
  imageUrl: null,
  isActive: true,
  order: 0,
  createdAt: TIME,
  updatedAt: TIME,
};

const categoryExample = {
  ...rootCategory,
  id: 42,
  slug: "gaming-laptops",
  parentId: 12,
  nameAZ: "Oyun noutbukları",
  nameEN: "Gaming laptops",
  nameRU: "Игровые ноутбуки",
};

const productExample = {
  id: PRODUCT_ID,
  sku: "LEN-LOQ-15-001",
  brand: "Lenovo",
  category: "gaming-laptops",
  imageUrl: "https://cdn.example.com/loq-15.jpg",
  price: "1299.9",
  currency: "USD",
  stock: 14,
  syncedAt: "2026-11-25T09:35:44.120Z",
  translations: [
    { id: 311, productId: PRODUCT_ID, lang: "EN", name: "Lenovo LOQ 15", description: "15.6\" gaming laptop, RTX 4050." },
    { id: 312, productId: PRODUCT_ID, lang: "AZ", name: "Lenovo LOQ 15", description: null },
  ],
};

const ok = (message: string, data?: unknown, status = 200) => ({
  statusCode: status,
  success: true,
  message,
  ...(data === undefined ? {} : { data }),
});

const productList = (data: unknown[], page = 1, limit = 20, total = data.length) => ({
  statusCode: 200,
  success: true,
  message: "Products retrieved",
  meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  data,
});

const categoryIdParam: Field = { name: "id", type: "integer ≥ 1", required: true, description: "Category id.", example: "42" };
const productIdParam: Field = { name: "id", type: "string (UUID)", required: true, description: "Product id (the `id` field, not the SKU).", example: PRODUCT_ID };

const categoryNotFound = err(404, "NOT_FOUND", "No category with this id.", "Category not found");
const productNotFound = err(404, "NOT_FOUND", "No product with this id.", "Product not found");
const badCategoryId = invalid("id is not a positive integer.", "", "Expected number, received nan");

const productFields: Field[] = [
  { name: "sku", type: "string (1–64)", required: true, description: "Unique stock-keeping unit. Letters, digits, space and . _ - / # +. Duplicates → 409.", example: "\"LEN-LOQ-15-001\"" },
  { name: "category", type: "string (slug)", required: true, description: "Slug of an existing category at any nesting depth.", example: "\"gaming-laptops\"" },
  { name: "translations", type: "array (1–3)", required: true, description: "Per-language content. Must contain an EN entry; each lang at most once.", example: "[{ \"lang\": \"EN\", \"name\": \"Lenovo LOQ 15\" }]" },
  { name: "translations[].lang", type: "\"EN\" | \"AZ\" | \"RU\"", required: true, description: "Language code (upper case).", example: "\"EN\"" },
  { name: "translations[].name", type: "string (1–200)", required: true, description: "Display name. HTML tags are stripped.", example: "\"Lenovo LOQ 15\"" },
  { name: "translations[].description", type: "string (≤5000)", required: false, description: "Plain text. HTML tags are stripped. Omit it for no description (null is rejected).", example: "\"15.6\\\" gaming laptop, RTX 4050.\"" },
  { name: "brand", type: "string (1–100) | null", required: false, description: "Brand name. Brand filters match this value exactly.", example: "\"Lenovo\"" },
  { name: "imageUrl", type: "string (http/https URL, ≤500) | null", required: false, description: "One product image. Upload the file elsewhere and pass its public URL.", example: "\"https://cdn.example.com/loq-15.jpg\"" },
  { name: "price", type: "number (≥0, max 2 decimals) | null", required: false, description: "Send a number. The API returns it as a decimal string, e.g. \"1299.9\".", example: "1299.9" },
  { name: "currency", type: "string (3 letters) | null", required: "when price is set", description: "ISO 4217 code such as USD, EUR or AZN. Upper-cased automatically.", example: "\"USD\"" },
  { name: "stock", type: "integer (0–1000000000) | null", required: false, description: "Units in stock.", example: "14" },
];

/** On PATCH every top-level field is optional; rules inside a `translations` item stay the same. */
const productPatchFields: Field[] = productFields.map((f) => {
  if (f.name === "translations[].lang" || f.name === "translations[].name") return { ...f, required: "when translations is sent" };
  if (f.name === "translations") return { ...f, required: false, description: "REPLACES all translations, so send every language you want to keep. Must contain EN." };
  if (f.name === "currency") return { ...f, required: false, description: "ISO 4217 code. Cannot be null while you are setting a price." };
  return { ...f, required: false };
});

const fullProductBody = {
  sku: "LEN-LOQ-15-001",
  brand: "Lenovo",
  category: "gaming-laptops",
  imageUrl: "https://cdn.example.com/loq-15.jpg",
  price: 1299.9,
  currency: "USD",
  stock: 14,
  translations: [
    { lang: "EN", name: "Lenovo LOQ 15", description: "15.6\" gaming laptop, RTX 4050." },
    { lang: "AZ", name: "Lenovo LOQ 15", description: "15.6\" oyun noutbuku, RTX 4050." },
    { lang: "RU", name: "Lenovo LOQ 15", description: "Игровой ноутбук 15.6\", RTX 4050." },
  ],
};

type GroupedEndpoint = Endpoint & { group: (typeof GROUPS)[number]["id"] };

const RAW_ENDPOINTS: GroupedEndpoint[] = [
  {
    id: "list-categories",
    group: "categories",
    method: "GET",
    path: "/categories",
    title: "List categories",
    permission: "categories:read",
    summary: "Returns every category, sorted by `order`, then `id`. Not paginated. Use tree=true for the hierarchy as nested `children` arrays (any depth).",
    queryParams: [
      { name: "tree", type: "\"true\" | \"false\"", required: false, description: "Default false = flat list. true = nested tree; roots have parentId null.", example: "tree=true" },
      { name: "activeOnly", type: "\"true\" | \"false\"", required: false, description: "Default false. true omits inactive categories; in tree mode an inactive category hides its whole subtree.", example: "activeOnly=true" },
    ],
    examples: [
      { label: "Flat list (no parameters)", path: "/categories" },
      {
        label: "Nested tree",
        path: "/categories?tree=true",
        response: ok("Categories retrieved", [{ ...rootCategory, children: [{ ...categoryExample, children: [] }] }]),
      },
      { label: "All optional parameters: active categories as a tree", path: "/categories?tree=true&activeOnly=true" },
    ],
    status: 200,
    response: ok("Categories retrieved", [rootCategory, categoryExample]),
    errors: [invalid("tree / activeOnly is not \"true\" or \"false\".", "tree", "Invalid enum value. Expected 'true' | 'false', received 'yes'")],
  },
  {
    id: "get-category",
    group: "categories",
    method: "GET",
    path: "/categories/{id}",
    title: "Get a category",
    permission: "categories:read",
    summary: "Returns one category (flat, without children).",
    pathParams: [categoryIdParam],
    examples: [{ label: "By id", path: "/categories/42" }],
    status: 200,
    response: ok("Category retrieved", categoryExample),
    errors: [badCategoryId, categoryNotFound],
  },
  {
    id: "create-category",
    group: "categories",
    method: "POST",
    path: "/categories",
    title: "Create a category or sub-category",
    permission: "categories:create",
    summary: "Creates a root category (send no parent) or a sub-category at any depth (send parentId or parentSlug). The parent must exist; slugs are unique across the whole tree. Unknown fields are rejected.",
    bodyFields: [
      { name: "nameEN", type: "string (1–100)", required: true, description: "English name. English is the fallback language, so it is mandatory.", example: "\"Gaming laptops\"" },
      { name: "slug", type: "string (2–80)", required: false, description: "Letters, digits and single hyphens (stored lower case). Generated from nameEN when omitted. Must be unique → 409.", example: "\"gaming-laptops\"" },
      { name: "parentId", type: "integer | null", required: false, description: "Id of the parent. null or omitted = root category.", example: "12" },
      { name: "parentSlug", type: "string (slug)", required: false, description: "Alternative to parentId. If both are sent they must point to the same category.", example: "\"laptops\"" },
      { name: "nameAZ", type: "string (≤100)", required: false, description: "Azerbaijani name. Default: empty string.", example: "\"Oyun noutbukları\"" },
      { name: "nameRU", type: "string (≤100)", required: false, description: "Russian name. Default: empty string.", example: "\"Игровые ноутбуки\"" },
      { name: "imageUrl", type: "string (≤500) | null", required: false, description: "Category image URL.", example: "\"https://cdn.example.com/gaming.jpg\"" },
      { name: "isActive", type: "boolean", required: false, description: "Default true.", example: "true" },
      { name: "order", type: "integer (0–100000)", required: false, description: "Sort position among siblings. Default 0.", example: "0" },
    ],
    examples: [
      { label: "Minimal root category (required field only)", note: "Only nameEN is required. nameAZ and nameRU are optional and stay empty here. The slug is generated: \"laptops\".", path: "/categories", body: { nameEN: "Laptops" } },
      { label: "Root category in all three languages", note: "nameAZ and nameRU are optional.", path: "/categories", body: { nameEN: "Laptops", nameAZ: "Noutbuklar", nameRU: "Ноутбуки" } },
      { label: "Sub-category using parentSlug", note: "nameAZ and nameRU are optional.", path: "/categories", body: { nameEN: "Gaming laptops", nameAZ: "Oyun noutbukları", nameRU: "Игровые ноутбуки", parentSlug: "laptops" } },
      { label: "Sub-category using parentId", note: "nameAZ and nameRU are optional.", path: "/categories", body: { nameEN: "Business laptops", nameAZ: "Biznes noutbukları", nameRU: "Бизнес-ноутбуки", parentId: 12 } },
      {
        label: "All fields, including every optional one",
        note: "parentId and parentSlug are alternatives. Both are shown here and must match.",
        path: "/categories",
        idempotency: true,
        body: {
          nameEN: "Gaming laptops",
          nameAZ: "Oyun noutbukları",
          nameRU: "Игровые ноутбуки",
          slug: "gaming-laptops",
          parentId: 12,
          parentSlug: "laptops",
          imageUrl: "https://cdn.example.com/gaming.jpg",
          isActive: true,
          order: 0,
        },
      },
    ],
    status: 201,
    response: ok("Category created", categoryExample, 201),
    errors: [
      invalid("A field is missing or invalid.", "nameEN", "Required"),
      invalid("An unknown field was sent.", "", "Unrecognized key(s) in object: 'color'"),
      err(400, "PARENT_MISMATCH", "parentId and parentSlug point to different categories.", "parentId and parentSlug refer to different categories"),
      err(400, "SLUG_REQUIRED", "No slug could be generated from nameEN (e.g. only symbols).", "Could not derive a slug from nameEN. Provide \"slug\" explicitly."),
      err(404, "PARENT_NOT_FOUND", "No category has this parentSlug.", "Parent category \"laptopz\" not found"),
      err(404, "NOT_FOUND", "No category has this parentId.", "Parent category not found"),
      err(409, "CONFLICT", "The slug is already taken.", "A category with this slug already exists"),
    ],
  },
  {
    id: "update-category",
    group: "categories",
    method: "PATCH",
    path: "/categories/{id}",
    title: "Update or move a category",
    permission: "categories:update",
    summary: "Partial update: send only the fields to change (at least one). parentId moves the category with its whole subtree; null makes it a root. parentSlug is not accepted here.",
    pathParams: [categoryIdParam],
    bodyFields: [
      { name: "nameEN", type: "string (1–100)", required: false, description: "Cannot be empty.", example: "\"Gaming notebooks\"" },
      { name: "nameAZ", type: "string (≤100)", required: false, description: "Azerbaijani name.", example: "\"Oyun noutbukları\"" },
      { name: "nameRU", type: "string (≤100)", required: false, description: "Russian name.", example: "\"Игровые ноутбуки\"" },
      { name: "slug", type: "string (2–80)", required: false, description: "Cannot change while products use the current slug (409 CATEGORY_IN_USE).", example: "\"gaming-notebooks\"" },
      { name: "parentId", type: "integer | null", required: false, description: "New parent, or null for root.", example: "12" },
      { name: "imageUrl", type: "string (≤500) | null", required: false, description: "null removes the image.", example: "null" },
      { name: "isActive", type: "boolean", required: false, description: "Show or hide the category (and, in tree mode, its subtree).", example: "false" },
      { name: "order", type: "integer (0–100000)", required: false, description: "Sort position.", example: "2" },
    ],
    examples: [
      { label: "Rename and re-order", path: "/categories/42", body: { nameEN: "Gaming notebooks", order: 2 } },
      { label: "Move under another parent", path: "/categories/42", body: { parentId: 7 } },
      { label: "Make it a root category", path: "/categories/42", body: { parentId: null } },
      { label: "Hide it", path: "/categories/42", body: { isActive: false } },
      {
        label: "All optional fields",
        path: "/categories/42",
        body: {
          nameEN: "Gaming notebooks",
          nameAZ: "Oyun noutbukları",
          nameRU: "Игровые ноутбуки",
          slug: "gaming-notebooks",
          parentId: 12,
          imageUrl: "https://cdn.example.com/gaming.jpg",
          isActive: true,
          order: 2,
        },
      },
    ],
    status: 200,
    response: ok("Category updated", { ...categoryExample, nameEN: "Gaming notebooks", order: 2 }),
    errors: [
      invalid("The body is empty.", "", "Provide at least one field to update"),
      err(400, "BAD_REQUEST", "The category was set as its own parent.", "A category cannot be its own parent"),
      err(400, "BAD_REQUEST", "The new parent is inside this category’s subtree.", "Cannot move a category under one of its own descendants"),
      categoryNotFound,
      err(404, "NOT_FOUND", "The new parent does not exist.", "Parent category not found"),
      err(409, "CONFLICT", "The new slug is already taken.", "A category with this slug already exists"),
      err(409, "CATEGORY_IN_USE", "Products use the current slug.", "Cannot change the slug: 3 product(s) reference \"gaming-laptops\"."),
    ],
  },
  {
    id: "delete-category",
    group: "categories",
    method: "DELETE",
    path: "/categories/{id}",
    title: "Delete a category",
    permission: "categories:delete",
    summary: "Deletes a category that has no sub-categories and no products. No body.",
    pathParams: [categoryIdParam],
    examples: [{ label: "By id", path: "/categories/42" }],
    status: 200,
    response: ok("Category deleted"),
    errors: [
      badCategoryId,
      categoryNotFound,
      err(409, "CONFLICT", "It still has sub-categories.", "Cannot delete: this category still has 2 sub-categories. Delete or move them first."),
      err(409, "CATEGORY_IN_USE", "Products still use it.", "Cannot delete: 3 product(s) still use this category."),
    ],
  },
  {
    id: "list-products",
    group: "products",
    method: "GET",
    path: "/products",
    title: "List products",
    permission: "products:read",
    summary: "Paginated product list, newest first. Prices and stock are always included. Filtering by a category includes all its sub-categories. Filters combine with AND. For several values use commas, not a repeated parameter.",
    queryParams: [
      { name: "category", type: "string (comma-separated slugs)", required: false, description: "Sub-categories at every depth are included.", example: "category=laptops,monitors" },
      { name: "categoryId", type: "string (comma-separated ids)", required: false, description: "Same as category, by id.", example: "categoryId=12,42" },
      { name: "brand", type: "string (comma-separated)", required: false, description: "Exact brand match.", example: "brand=Lenovo,Dell" },
      { name: "q", type: "string (≤100)", required: false, description: "Case-insensitive search in SKU, brand and product names. URL-encode it.", example: "q=loq%2015" },
      { name: "minPrice", type: "number ≥ 0", required: false, description: "Lowest price. Products without a price are excluded.", example: "minPrice=500" },
      { name: "maxPrice", type: "number ≥ 0", required: false, description: "Highest price. Products without a price are excluded.", example: "maxPrice=1500" },
      { name: "page", type: "integer 1–100000", required: false, description: "Default 1.", example: "page=2" },
      { name: "limit", type: "integer 1–100", required: false, description: "Default 20.", example: "limit=50" },
    ],
    examples: [
      { label: "First page (no parameters)", path: "/products" },
      { label: "One category with its sub-categories", path: "/products?category=laptops" },
      { label: "Several brands", path: "/products?brand=Lenovo,Dell" },
      { label: "Search text", path: "/products?q=loq%2015" },
      { label: "Price range", path: "/products?minPrice=500&maxPrice=1500" },
      {
        label: "Pagination",
        path: "/products?page=2&limit=50",
        response: productList([productExample], 2, 50, 51),
      },
      {
        label: "All optional parameters together",
        note: "categoryId adds to category: products from either selection match.",
        path: "/products?category=laptops&categoryId=42&brand=Lenovo&q=loq&minPrice=500&maxPrice=1500&page=1&limit=20",
      },
    ],
    status: 200,
    response: productList([productExample]),
    errors: [invalid("A query parameter is invalid.", "limit", "Number must be less than or equal to 100")],
  },
  {
    id: "get-product",
    group: "products",
    method: "GET",
    path: "/products/{id}",
    title: "Get a product",
    permission: "products:read",
    summary: "Returns one product with all of its translations.",
    pathParams: [productIdParam],
    examples: [{ label: "By id", path: `/products/${PRODUCT_ID}` }],
    status: 200,
    response: ok("Product retrieved", productExample),
    errors: [productNotFound],
  },
  {
    id: "get-product-by-sku",
    group: "products",
    method: "GET",
    path: "/products/sku/{sku}",
    title: "Get a product by SKU",
    permission: "products:read",
    summary: "Exact SKU lookup. Useful before deciding whether to create or update during an ERP sync.",
    pathParams: [{ name: "sku", type: "string (1–64)", required: true, description: "The product SKU, URL-encoded (space → %20, / → %2F, # → %23).", example: "LEN-LOQ-15-001" }],
    examples: [
      { label: "Simple SKU", path: "/products/sku/LEN-LOQ-15-001" },
      { label: "SKU with a space and a slash (\"AB 12/3\")", path: "/products/sku/AB%2012%2F3" },
    ],
    status: 200,
    response: ok("Product retrieved", productExample),
    errors: [err(404, "NOT_FOUND", "No product with this SKU.", "Product not found")],
  },
  {
    id: "create-product",
    group: "products",
    method: "POST",
    path: "/products",
    title: "Create a product",
    permission: "products:create",
    summary: "Creates a product. The category must already exist (create it first with POST /categories). Unknown fields are rejected, so id and syncedAt cannot be set.",
    bodyFields: productFields,
    examples: [
      {
        label: "Minimal (required fields only)",
        path: "/products",
        body: { sku: "LEN-LOQ-15-001", category: "gaming-laptops", translations: [{ lang: "EN", name: "Lenovo LOQ 15" }] },
      },
      {
        label: "With price and stock",
        note: "currency is required as soon as price is sent. The AZ and RU translations are optional.",
        path: "/products",
        body: {
          sku: "LEN-LOQ-15-002",
          category: "gaming-laptops",
          price: 1099,
          currency: "USD",
          stock: 5,
          translations: [
            { lang: "EN", name: "Lenovo LOQ 15 (RTX 3050)" },
            { lang: "AZ", name: "Lenovo LOQ 15 (RTX 3050)" },
            { lang: "RU", name: "Lenovo LOQ 15 (RTX 3050)" },
          ],
        },
      },
      { label: "All fields, including every optional one", path: "/products", idempotency: true, body: fullProductBody },
    ],
    status: 201,
    response: ok("Product created", productExample, 201),
    errors: [
      invalid("The English translation is missing.", "translations", "An EN (English) translation is required"),
      invalid("price was sent without currency.", "currency", "currency is required when price is set"),
      invalid("price has too many decimals.", "price", "Price may have at most 2 decimal places"),
      err(400, "BAD_REQUEST", "No category has this slug.", "Category \"gaming-laptopz\" does not exist"),
      err(409, "CONFLICT", "The SKU already exists.", "A product with this SKU already exists"),
    ],
  },
  {
    id: "update-product",
    group: "products",
    method: "PATCH",
    path: "/products/{id}",
    title: "Update a product",
    permission: "products:update",
    summary: "Partial update (at least one field). Send null to clear brand, imageUrl, price, currency or stock. If translations is sent it replaces the whole set.",
    pathParams: [productIdParam],
    bodyFields: productPatchFields,
    examples: [
      { label: "Price and stock", path: `/products/${PRODUCT_ID}`, body: { price: 1199, currency: "USD", stock: 9 } },
      { label: "Stock only", path: `/products/${PRODUCT_ID}`, body: { stock: 0 } },
      { label: "Clear optional values", path: `/products/${PRODUCT_ID}`, body: { brand: null, imageUrl: null, price: null, currency: null, stock: null } },
      {
        label: "Replace translations",
        note: "Languages you leave out are removed.",
        path: `/products/${PRODUCT_ID}`,
        body: {
          translations: [
            { lang: "EN", name: "Lenovo LOQ 15 (2026)", description: "Updated model." },
            { lang: "AZ", name: "Lenovo LOQ 15 (2026)", description: "Yenilənmiş model." },
            { lang: "RU", name: "Lenovo LOQ 15 (2026)", description: "Обновлённая модель." },
          ],
        },
      },
      { label: "All optional fields", path: `/products/${PRODUCT_ID}`, body: fullProductBody },
    ],
    status: 200,
    response: ok("Product updated", { ...productExample, price: "1199", stock: 9 }),
    errors: [
      invalid("The body is empty.", "", "Provide at least one field to update"),
      invalid("currency set to null while a price is sent.", "currency", "currency cannot be null while price is set"),
      err(400, "BAD_REQUEST", "No category has this slug.", "Category \"gaming-laptopz\" does not exist"),
      productNotFound,
      err(409, "CONFLICT", "The new SKU belongs to another product.", "A record with this sku already exists"),
    ],
  },
  {
    id: "delete-product",
    group: "products",
    method: "DELETE",
    path: "/products/{id}",
    title: "Delete a product",
    permission: "products:delete",
    summary: "Permanently deletes a product and its translations. Refused while customer inquiries reference it. No body.",
    pathParams: [productIdParam],
    examples: [{ label: "By id", path: `/products/${PRODUCT_ID}` }],
    status: 200,
    response: ok("Product deleted"),
    errors: [productNotFound, err(409, "IN_USE", "Customer inquiries still reference the product.", "This record is still referenced by other data (for example customer inquiries).")],
  },
];

export const ENDPOINTS: GroupedEndpoint[] = RAW_ENDPOINTS.map((e) => ({ ...e, errors: withCommon(e.method, e.permission, e.errors) }));

// ------------------------------------------------------------- end-to-end workflow

export interface WorkflowStep extends RequestExample {
  method: Endpoint["method"];
}

/** Ids (42, 43, …) are examples: use the ids returned by your own requests. */
export const WORKFLOW: WorkflowStep[] = [
  { method: "POST", label: "Create a root category", note: "Needs categories:create.", path: "/categories", body: { slug: "laptops", nameEN: "Laptops", nameAZ: "Noutbuklar", nameRU: "Ноутбуки" } },
  { method: "POST", label: "Create a sub-category", path: "/categories", body: { slug: "gaming-laptops", parentSlug: "laptops", nameEN: "Gaming laptops", nameAZ: "Oyun noutbukları", nameRU: "Игровые ноутбуки" } },
  { method: "POST", label: "Create a level-3 sub-category", path: "/categories", body: { slug: "rtx-gaming-laptops", parentSlug: "gaming-laptops", nameEN: "RTX gaming laptops", nameAZ: "RTX oyun noutbukları", nameRU: "Игровые ноутбуки RTX" } },
  { method: "GET", label: "Check the tree", note: "Needs categories:read.", path: "/categories?tree=true" },
  {
    method: "POST",
    label: "Create a product in the deepest category",
    note: "Needs products:create.",
    path: "/products",
    idempotency: true,
    body: { ...fullProductBody, category: "rtx-gaming-laptops" },
  },
  { method: "GET", label: "Find it by SKU and note its id", note: "Needs products:read.", path: "/products/sku/LEN-LOQ-15-001" },
  { method: "PATCH", label: "Update price and stock", note: "Needs products:update.", path: `/products/${PRODUCT_ID}`, body: { price: 1199, currency: "USD", stock: 9 } },
  { method: "DELETE", label: "Delete the product", note: "Needs products:delete.", path: `/products/${PRODUCT_ID}` },
  { method: "DELETE", label: "Delete the categories, deepest first", note: "Needs categories:delete. Repeat for the level-2 and then the root category.", path: "/categories/43" },
];

// ------------------------------------------------------------- code samples

const KEY_PLACEHOLDER = "YOUR_API_KEY";

type SampleRequest = Pick<RequestExample, "path" | "body" | "idempotency"> & { method: Endpoint["method"] };

export function curlSample(baseUrl: string, r: SampleRequest) {
  const parts = [`curl -X ${r.method} "${baseUrl}${r.path}"`, `  -H "X-API-Key: ${KEY_PLACEHOLDER}"`];
  if (r.idempotency) parts.push(`  -H "Idempotency-Key: $(uuidgen)"`);
  if (r.body !== undefined) {
    parts.push(`  -H "Content-Type: application/json"`);
    parts.push(`  -d '${JSON.stringify(r.body, null, 2).replace(/'/g, "'\\''")}'`);
  }
  return parts.join(" \\\n");
}

export function fetchSample(baseUrl: string, r: SampleRequest) {
  const headers = [`    "X-API-Key": process.env.CYBERSPACE_API_KEY, // never hard-code or expose the key`];
  if (r.idempotency) headers.push(`    "Idempotency-Key": crypto.randomUUID(), // optional; reuse the same value when retrying`);
  if (r.body !== undefined) headers.push(`    "Content-Type": "application/json",`);
  const lines = [`const res = await fetch("${baseUrl}${r.path}", {`, `  method: "${r.method}",`, `  headers: {`, ...headers, `  },`];
  if (r.body !== undefined) lines.push(`  body: JSON.stringify(${JSON.stringify(r.body, null, 2).replace(/\n/g, "\n  ")}),`);
  lines.push(`});`, `const json = await res.json();`, `if (!res.ok) throw new Error(\`\${json.code}: \${json.message}\`);`, `console.log(json);`);
  return lines.join("\n");
}

export const pretty = (v: unknown) => JSON.stringify(v, null, 2);

/** Every error code once (first occurrence wins), plus the ones not tied to a listed endpoint. */
export const ERROR_CODES: ApiErrorDoc[] = [
  ...new Map(
    [
      ...ENDPOINTS.flatMap((e) => e.errors),
      err(404, "ENDPOINT_NOT_FOUND", "The URL or method does not exist.", "Endpoint not found"),
      err(500, "INTERNAL_ERROR", "Unexpected server error. Details are logged server-side only.", "Internal server error"),
    ].map((e) => [e.code, e] as const).reverse(),
  ).values(),
].sort((a, b) => a.status - b.status || a.code.localeCompare(b.code));

/** Generic wording for codes that several endpoints use for different reasons. */
export const ERROR_MEANINGS: Record<string, string> = {
  VALIDATION_ERROR: "Body or query failed validation. `error[]` lists each field path and message.",
  BAD_REQUEST: "The request breaks a business rule, e.g. unknown category or a circular move.",
  NOT_FOUND: "The record does not exist.",
  CONFLICT: "Duplicate slug or SKU, or the category still has sub-categories.",
  CATEGORY_IN_USE: "Products still use the category.",
  INSUFFICIENT_PERMISSIONS: "The key does not include the permission the endpoint needs.",
};
