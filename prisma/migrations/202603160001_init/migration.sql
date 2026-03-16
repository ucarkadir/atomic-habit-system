-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "habitName" TEXT NOT NULL,
    "identityStatement" TEXT,
    "implementationIntention" TEXT,
    "habitStacking" TEXT,
    "trackingStacking" TEXT,
    "weeklyTargetText" TEXT,
    "metric1Label" TEXT,
    "metric1Unit" TEXT,
    "metric2Label" TEXT,
    "metric2Unit" TEXT,
    "supportsCompletedOnly" BOOLEAN NOT NULL DEFAULT false,
    "invertScore" BOOLEAN NOT NULL DEFAULT false,
    "ruleJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "metric1Value" DOUBLE PRECISION,
    "metric2Value" DOUBLE PRECISION,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitSchedule" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "isPlanned" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "HabitSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Habit_userId_createdAt_idx" ON "Habit"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyEntry_userId_habitId_date_key" ON "DailyEntry"("userId", "habitId", "date");
CREATE INDEX "DailyEntry_userId_date_idx" ON "DailyEntry"("userId", "date");
CREATE INDEX "DailyEntry_habitId_date_idx" ON "DailyEntry"("habitId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "HabitSchedule_habitId_weekday_key" ON "HabitSchedule"("habitId", "weekday");
CREATE INDEX "HabitSchedule_weekday_idx" ON "HabitSchedule"("weekday");

-- AddForeignKey
ALTER TABLE "DailyEntry" ADD CONSTRAINT "DailyEntry_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HabitSchedule" ADD CONSTRAINT "HabitSchedule_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
