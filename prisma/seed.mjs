import { PrismaClient, Category, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@smc.local" },
    update: {},
    create: {
      name: "SMC Admin",
      affiliation: "SMC",
      email: "admin@smc.local",
      password: "admin1234",
      role: UserRole.ADMIN,
    },
  });

  const issue1 = await prisma.issue.create({
    data: {
      title: "도시 열섬 완화 기술의 현실성",
      description: "여름철 도시 열섬을 줄이기 위한 반사 도료, 쿨루프, 녹지 확장 정책의 우선순위를 논의합니다.",
      imageUrl: "https://images.unsplash.com/photo-1497543050022-eadb0f43d5c6?auto=format&fit=crop&w=1200&q=80",
      tags: ["기후", "도시정책", "적응"],
      category: Category.CLIMATE,
      relatedIssueIds: [],
      createdBy: admin.id,
    },
  });

  await prisma.issue.create({
    data: {
      title: "AI 기반 신약 후보 발굴의 규제 쟁점",
      description: "생성형 AI를 활용한 후보물질 탐색이 임상 전 단계에서 갖는 가능성과 검증 책임 범위를 다룹니다.",
      imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
      tags: ["생명보건의료", "AI", "규제"],
      category: Category.BIO_HEALTH_MEDICAL,
      relatedIssueIds: [issue1.id],
      createdBy: admin.id,
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
