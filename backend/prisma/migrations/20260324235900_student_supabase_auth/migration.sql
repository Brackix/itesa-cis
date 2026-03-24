-- Student Supabase auth support
ALTER TABLE "Student"
    ALTER COLUMN "passwordHash" DROP NOT NULL;

ALTER TABLE "Student"
    ADD COLUMN "institutionalEmail" TEXT,
    ADD COLUMN "supabaseUserId" TEXT;

CREATE UNIQUE INDEX "Student_institutionalEmail_key" ON "Student"("institutionalEmail");
CREATE UNIQUE INDEX "Student_supabaseUserId_key" ON "Student"("supabaseUserId");
