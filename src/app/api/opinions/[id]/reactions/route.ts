import { NextResponse } from "next/server";
import { ReactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { email, reactionType } = body ?? {};

  if (!email || !reactionType || !["UP", "DOWN"].includes(reactionType)) {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "가입자만 반응할 수 있습니다." }, { status: 403 });
  }

  const opinion = await prisma.opinion.findUnique({ where: { id } });
  if (!opinion) {
    return NextResponse.json({ error: "의견을 찾을 수 없습니다." }, { status: 404 });
  }

  const existing = await prisma.reaction.findUnique({
    where: { opinionId_userId: { opinionId: id, userId: user.id } },
  });

  if (existing && existing.reactionType === reactionType) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.reaction.update({ where: { id: existing.id }, data: { reactionType: reactionType as ReactionType } });
  } else {
    await prisma.reaction.create({
      data: { opinionId: id, userId: user.id, reactionType: reactionType as ReactionType },
    });
  }

  return NextResponse.json({ message: "반응이 반영되었습니다." });
}
