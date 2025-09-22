-- Performance indexes for Split Bill application
-- Run: bun run db:execute-raw --file=add_indexes.sql

-- User table indexes
CREATE INDEX IF NOT EXISTS "User_clerkId_idx" ON "User"("clerkId");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- Group table indexes  
CREATE INDEX IF NOT EXISTS "Group_createdBy_idx" ON "Group"("createdBy");
CREATE INDEX IF NOT EXISTS "Group_status_idx" ON "Group"("status");
CREATE INDEX IF NOT EXISTS "Group_createdAt_idx" ON "Group"("createdAt");
CREATE INDEX IF NOT EXISTS "Group_createdBy_status_idx" ON "Group"("createdBy", "status");
CREATE INDEX IF NOT EXISTS "Group_billId_idx" ON "Group"("billId");

-- GroupMember table indexes
CREATE INDEX IF NOT EXISTS "GroupMember_groupId_idx" ON "GroupMember"("groupId");
CREATE INDEX IF NOT EXISTS "GroupMember_userId_idx" ON "GroupMember"("userId");
CREATE INDEX IF NOT EXISTS "GroupMember_groupId_role_idx" ON "GroupMember"("groupId", "role");

-- Settlement table indexes
CREATE INDEX IF NOT EXISTS "Settlement_groupId_idx" ON "Settlement"("groupId");
CREATE INDEX IF NOT EXISTS "Settlement_payerId_idx" ON "Settlement"("payerId");
CREATE INDEX IF NOT EXISTS "Settlement_receiverId_idx" ON "Settlement"("receiverId");
CREATE INDEX IF NOT EXISTS "Settlement_status_idx" ON "Settlement"("status");
CREATE INDEX IF NOT EXISTS "Settlement_groupId_status_idx" ON "Settlement"("groupId", "status");
CREATE INDEX IF NOT EXISTS "Settlement_payerId_status_idx" ON "Settlement"("payerId", "status");

-- Bill table indexes
CREATE INDEX IF NOT EXISTS "Bill_createdBy_idx" ON "Bill"("createdBy");
CREATE INDEX IF NOT EXISTS "Bill_date_idx" ON "Bill"("date");
CREATE INDEX IF NOT EXISTS "Bill_createdAt_idx" ON "Bill"("createdAt");
CREATE INDEX IF NOT EXISTS "Bill_merchantName_idx" ON "Bill"("merchantName");

-- BillItem table indexes
CREATE INDEX IF NOT EXISTS "BillItem_billId_idx" ON "BillItem"("billId");
CREATE INDEX IF NOT EXISTS "BillItem_category_idx" ON "BillItem"("category");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "Group_createdBy_createdAt_idx" ON "Group"("createdBy", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Settlement_groupId_createdAt_idx" ON "Settlement"("groupId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Bill_createdBy_date_idx" ON "Bill"("createdBy", "date" DESC);