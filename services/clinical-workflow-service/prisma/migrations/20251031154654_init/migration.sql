-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- CreateEnum
CREATE TYPE "UnifiedOrderStatus" AS ENUM ('NEW', 'PARTIALLY_FULFILLED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('PHARMACY', 'LAB', 'RADIOLOGY', 'PROCEDURE');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('REQUESTED', 'IN_PROGRESS', 'COMPLETED', 'ERROR');

-- CreateTable
CREATE TABLE "UnifiedOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "priority" "OrderPriority" NOT NULL,
    "status" "UnifiedOrderStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnifiedOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnifiedOrderItem" (
    "id" TEXT NOT NULL,
    "unifiedOrderId" TEXT NOT NULL,
    "itemType" "OrderItemType" NOT NULL,
    "targetServiceOrderId" TEXT NOT NULL,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'REQUESTED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnifiedOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowEvent" (
    "id" TEXT NOT NULL,
    "unifiedOrderId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnifiedOrder_orderNumber_key" ON "UnifiedOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "UnifiedOrder_patientId_idx" ON "UnifiedOrder"("patientId");

-- CreateIndex
CREATE INDEX "UnifiedOrder_providerId_idx" ON "UnifiedOrder"("providerId");

-- CreateIndex
CREATE INDEX "UnifiedOrderItem_unifiedOrderId_idx" ON "UnifiedOrderItem"("unifiedOrderId");

-- CreateIndex
CREATE INDEX "UnifiedOrderItem_itemType_idx" ON "UnifiedOrderItem"("itemType");

-- CreateIndex
CREATE INDEX "WorkflowEvent_unifiedOrderId_idx" ON "WorkflowEvent"("unifiedOrderId");

-- CreateIndex
CREATE INDEX "WorkflowEvent_eventType_idx" ON "WorkflowEvent"("eventType");

-- AddForeignKey
ALTER TABLE "UnifiedOrderItem" ADD CONSTRAINT "UnifiedOrderItem_unifiedOrderId_fkey" FOREIGN KEY ("unifiedOrderId") REFERENCES "UnifiedOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowEvent" ADD CONSTRAINT "WorkflowEvent_unifiedOrderId_fkey" FOREIGN KEY ("unifiedOrderId") REFERENCES "UnifiedOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
