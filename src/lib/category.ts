import { Category } from "@prisma/client";

export const categoryMap = {
  기초과학: Category.BASIC_SCIENCE,
  기후: Category.CLIMATE,
  생명보건의료: Category.BIO_HEALTH_MEDICAL,
  기술: Category.TECHNOLOGY,
  사회및사건사고: Category.SOCIETY_INCIDENTS,
  기타: Category.OTHER,
} as const;

export const categoryLabelMap: Record<Category, string> = {
  BASIC_SCIENCE: "기초과학",
  CLIMATE: "기후",
  BIO_HEALTH_MEDICAL: "생명보건의료",
  TECHNOLOGY: "기술",
  SOCIETY_INCIDENTS: "사회및사건사고",
  OTHER: "기타",
};
