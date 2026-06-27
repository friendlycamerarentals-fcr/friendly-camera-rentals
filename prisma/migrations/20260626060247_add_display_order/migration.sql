-- AlterTable
ALTER TABLE "public"."BuyProduct" ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."RentalProduct" ADD COLUMN     "display_order" INTEGER NOT NULL DEFAULT 0;
