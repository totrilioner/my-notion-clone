-- CreateTable
CREATE TABLE "sop_blueprints" (
    "id" TEXT NOT NULL,
    "sopId" TEXT,
    "title" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "ownerRole" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "summary" TEXT,
    "graphJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sop_blueprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obsidian_maps" (
    "id" TEXT NOT NULL,
    "sopId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL DEFAULT 'topic',
    "label" TEXT NOT NULL,
    "parentId" TEXT,
    "relatedTo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obsidian_maps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sop_blueprints_sopId_key" ON "sop_blueprints"("sopId");

-- CreateIndex
CREATE UNIQUE INDEX "obsidian_maps_sopId_nodeId_key" ON "obsidian_maps"("sopId", "nodeId");
