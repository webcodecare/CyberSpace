import type { Locale } from "@/lib/i18n";

export type CategoryId =
  | "servers"
  | "networking"
  | "security"
  | "computers"
  | "storage"
  | "software"
  | "printing"
  | "consumer";

export const CATEGORIES: { id: CategoryId; name: Record<Locale, string> }[] = [
  {
    id: "servers",
    name: {
      en: "Servers & Infrastructure",
      az: "Serverlər və infrastruktur",
      ru: "Серверы и инфраструктура",
    },
  },
  {
    id: "networking",
    name: { en: "Networking", az: "Şəbəkə avadanlığı", ru: "Сетевое оборудование" },
  },
  { id: "security", name: { en: "Security", az: "Təhlükəsizlik", ru: "Безопасность" } },
  {
    id: "computers",
    name: {
      en: "Computers & Accessories",
      az: "Kompüterlər və aksesuarlar",
      ru: "Компьютеры и аксессуары",
    },
  },
  {
    id: "storage",
    name: {
      en: "Storage & Data Management",
      az: "Yaddaş və məlumat idarəetməsi",
      ru: "Хранение данных",
    },
  },
  {
    id: "software",
    name: { en: "Software", az: "Proqram təminatı", ru: "Программное обеспечение" },
  },
  {
    id: "printing",
    name: { en: "Printing & Imaging", az: "Çap və təsvir", ru: "Печать və izображение" },
  },
  {
    id: "consumer",
    name: {
      en: "Consumer Electronics",
      az: "İstehlak elektronikası",
      ru: "Потребительская elektronika",
    },
  },
];

export const BRANDS = [
  "Dell",
  "HPE",
  "HP",
  "Cisco",
  "Lenovo",
  "Microsoft",
  "APC",
  "Fortinet",
  "Axis",
  "Logitech",
];

export type PublicProduct = {
  id: string;
  sku: string;
  name: string;
  names: Record<string, string>;
  descriptions: Record<string, string>;
  brand: string;
  category: string;
  imageUrl: string | null;
  price: number | null;
  currency: "USD" | "AZN" | null;
  stock: number | null;
  specs: [string, string][];
};
