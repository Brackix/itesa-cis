-- CreateEnum
CREATE TYPE "evaluation_phase" AS ENUM ('preparation', 'fair');

-- CreateEnum
CREATE TYPE "project_criterion_status" AS ENUM ('in_progress', 'achieved', 'not_achieved', 'late');

-- CreateEnum
CREATE TYPE "user_roles" AS ENUM ('brackix', 'user');

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL,
    "group_name" VARCHAR NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups_students" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "is_coordinator" BOOLEAN DEFAULT false,

    CONSTRAINT "groups_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_criteria" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,

    CONSTRAINT "project_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_criterion_evaluations" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "criterion_id" UUID NOT NULL,
    "phase" "evaluation_phase" NOT NULL DEFAULT 'preparation',
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "status" "project_criterion_status" NOT NULL DEFAULT 'in_progress',
    "notes" TEXT,

    CONSTRAINT "project_criterion_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "group_id" UUID NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "list_number" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,
    "last_name" VARCHAR NOT NULL,
    "section" CHAR(1) NOT NULL,
    "image_url" TEXT,
    "alt_text" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_roles" NOT NULL DEFAULT 'user',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "name" CHAR(1) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE INDEX "groups_group_name_idx" ON "groups"("group_name");

-- CreateIndex
CREATE UNIQUE INDEX "groups_students_group_id_student_id_idx" ON "groups_students"("group_id", "student_id");

-- CreateIndex
CREATE INDEX "students_list_number_idx" ON "students"("list_number");

-- CreateIndex
CREATE INDEX "students_name_last_name_idx" ON "students"("name", "last_name");

-- CreateIndex
CREATE INDEX "students_section_idx" ON "students"("section");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "groups_students" ADD CONSTRAINT "groups_students_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "groups_students" ADD CONSTRAINT "groups_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_criterion_evaluations" ADD CONSTRAINT "project_criterion_evaluations_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "project_criteria"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_criterion_evaluations" ADD CONSTRAINT "project_criterion_evaluations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_section_fkey" FOREIGN KEY ("section") REFERENCES "sections"("name") ON DELETE NO ACTION ON UPDATE NO ACTION;
