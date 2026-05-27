export type Category =
  | "기초과학"
  | "기후"
  | "생명보건의료"
  | "기술"
  | "사회및사건사고"
  | "기타";

export type IssueStatus = "OPEN" | "ARCHIVED" | "HIDDEN";
export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  name: string;
  affiliation: string;
  email: string;
  password: string;
  role: UserRole;
};

export type Issue = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  category: Category;
  relatedIssueIds: string[];
  status: IssueStatus;
  createdBy: string;
  createdAt: string;
};

export type Opinion = {
  id: string;
  issueId: string;
  title: string;
  body: string;
  authorId: string;
  quoteOpinionId?: string;
  votes: { up: number; down: number };
  createdAt: string;
};

const users: User[] = [
  {
    id: "u-admin-1",
    name: "SMC Admin",
    affiliation: "SMC",
    email: "admin@smc.local",
    password: "admin1234",
    role: "ADMIN",
  },
];

const issues: Issue[] = [
  {
    id: "issue-1",
    title: "도시 열섬 완화 기술의 현실성",
    description:
      "여름철 도시 열섬을 줄이기 위한 반사 도료, 쿨루프, 녹지 확장 정책의 우선순위를 논의합니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1497543050022-eadb0f43d5c6?auto=format&fit=crop&w=1200&q=80",
    tags: ["기후", "도시정책", "적응"],
    category: "기후",
    relatedIssueIds: [],
    status: "OPEN",
    createdBy: "u-admin-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "issue-2",
    title: "AI 기반 신약 후보 발굴의 규제 쟁점",
    description:
      "생성형 AI를 활용한 후보물질 탐색이 임상 전 단계에서 갖는 가능성과 검증 책임 범위를 다룹니다.",
    imageUrl:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
    tags: ["생명보건의료", "AI", "규제"],
    category: "생명보건의료",
    relatedIssueIds: ["issue-1"],
    status: "OPEN",
    createdBy: "u-admin-1",
    createdAt: new Date().toISOString(),
  },
];

const opinions: Opinion[] = [];

const makeId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const db = {
  users,
  issues,
  opinions,
  makeId,
};

export const categoryList: Category[] = [
  "기초과학",
  "기후",
  "생명보건의료",
  "기술",
  "사회및사건사고",
  "기타",
];
