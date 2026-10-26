export const tagTypes = {
  user: "user",
  product: "product",
  inquiry: "inquiry",
  settings: "settings",
  partner: "partner",
  news: "news",
  category: "category",
} as const;

export type TagType = (typeof tagTypes)[keyof typeof tagTypes];
