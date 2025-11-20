-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('TRUE_OR_FALSE', 'MULTI_CHOICE', 'SIMPLE_QUESTION');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdById" INTEGER NOT NULL,
    "approvedById" INTEGER,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "type" "TaskType" NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrueOrFalseTask" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" BOOLEAN NOT NULL,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "TrueOrFalseTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultiChoiceTask" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "MultiChoiceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultiChoiceAnswer" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "isTrue" BOOLEAN NOT NULL,
    "multiChoiceTaskId" INTEGER NOT NULL,

    CONSTRAINT "MultiChoiceAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimpleQuestionTask" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answers" TEXT[],
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "SimpleQuestionTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletedMission" (
    "id" SERIAL NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "missionId" INTEGER NOT NULL,

    CONSTRAINT "CompletedMission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Mission_taskId_key" ON "Mission"("taskId");

-- CreateIndex
CREATE INDEX "Mission_longitude_latitude_idx" ON "Mission"("longitude", "latitude");

-- CreateIndex
CREATE INDEX "Mission_status_idx" ON "Mission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TrueOrFalseTask_taskId_key" ON "TrueOrFalseTask"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "MultiChoiceTask_taskId_key" ON "MultiChoiceTask"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "SimpleQuestionTask_taskId_key" ON "SimpleQuestionTask"("taskId");

-- CreateIndex
CREATE INDEX "CompletedMission_userId_idx" ON "CompletedMission"("userId");

-- CreateIndex
CREATE INDEX "CompletedMission_missionId_idx" ON "CompletedMission"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedMission_userId_missionId_key" ON "CompletedMission"("userId", "missionId");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrueOrFalseTask" ADD CONSTRAINT "TrueOrFalseTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiChoiceTask" ADD CONSTRAINT "MultiChoiceTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiChoiceAnswer" ADD CONSTRAINT "MultiChoiceAnswer_multiChoiceTaskId_fkey" FOREIGN KEY ("multiChoiceTaskId") REFERENCES "MultiChoiceTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimpleQuestionTask" ADD CONSTRAINT "SimpleQuestionTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedMission" ADD CONSTRAINT "CompletedMission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedMission" ADD CONSTRAINT "CompletedMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
