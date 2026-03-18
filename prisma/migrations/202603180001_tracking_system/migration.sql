ALTER TABLE "Habit"
ALTER COLUMN "implementationIntention" SET DEFAULT '',
ALTER COLUMN "habitStacking" SET DEFAULT '',
ALTER COLUMN "trackingStacking" SET DEFAULT 'Manuel takip';

UPDATE "Habit"
SET
  "implementationIntention" = COALESCE("implementationIntention", ''),
  "habitStacking" = COALESCE("habitStacking", ''),
  "trackingStacking" = COALESCE("trackingStacking", 'Manuel takip');

ALTER TABLE "Habit"
ALTER COLUMN "implementationIntention" SET NOT NULL,
ALTER COLUMN "habitStacking" SET NOT NULL,
ALTER COLUMN "trackingStacking" SET NOT NULL;

ALTER TABLE "DailyEntry"
ADD COLUMN "trackingConfirmed" BOOLEAN NOT NULL DEFAULT false;
