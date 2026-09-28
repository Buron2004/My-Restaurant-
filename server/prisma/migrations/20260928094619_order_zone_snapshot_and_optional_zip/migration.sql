-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryZoneLabel" TEXT,
ALTER COLUMN "deliveryZip" DROP NOT NULL;
