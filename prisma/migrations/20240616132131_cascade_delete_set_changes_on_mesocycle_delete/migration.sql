-- DropForeignKey
ALTER TABLE "MesocycleCyclicSetChange" DROP CONSTRAINT "MesocycleCyclicSetChange_mesocycleId_fkey";

-- AddForeignKey
ALTER TABLE "MesocycleCyclicSetChange" ADD CONSTRAINT "MesocycleCyclicSetChange_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
