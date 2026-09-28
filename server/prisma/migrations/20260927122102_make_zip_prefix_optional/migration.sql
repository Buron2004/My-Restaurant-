-- DropIndex
DROP INDEX "DeliveryZone_zipPrefix_key";

-- AlterTable
ALTER TABLE "DeliveryZone" ALTER COLUMN "zipPrefix" DROP NOT NULL;
