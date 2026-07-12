import { pgTable, serial, text, timestamp, integer, decimal, boolean, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", ["developer", "Secretary", "Member"]);
export const statusEnum = pgEnum("member_status", ["Active", "Inactive"]);
export const loanStatusEnum = pgEnum("loan_status", ["Active", "Fully Paid", "Overdue"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["Present", "Absent", "Excused"]);

export const developerConfig = pgTable("developer_config", {
  id: serial("id").primaryKey(),
  developerPassword: text("developer_password").notNull().default("chaye1996"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  groupId: text("group_id").notNull().unique(),
  name: text("name").notNull(),
  allowBroadcast: boolean("allow_broadcast").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  membershipNo: text("membership_no").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  role: roleEnum("role").notNull().default("Member"),
  passwordHash: text("password_hash").notNull(),
  status: statusEnum("status").notNull().default("Active"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    uniqueMember: uniqueIndex("idx_group_member_no").on(table.groupId, table.membershipNo),
  }
});

export const savings = pgTable("savings", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  memberId: integer("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  transactionDate: text("transaction_date").notNull(),
  recordedBy: text("recorded_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  memberId: integer("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  principal: decimal("principal", { precision: 15, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull().default("10.00"),
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  status: loanStatusEnum("status").notNull().default("Active"),
  recordedBy: text("recorded_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const repayments = pgTable("repayments", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  loanId: integer("loan_id").references(() => loans.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  repaymentDate: text("repayment_date").notNull(),
  recordedBy: text("recorded_by").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  memberId: integer("member_id").references(() => members.id, { onDelete: "cascade" }).notNull(),
  meetingDate: text("meeting_date").notNull(),
  status: attendanceStatusEnum("status").notNull().default("Present"),
  recordedBy: text("recorded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
  return {
    uniqueAttendance: uniqueIndex("idx_group_attendance").on(table.groupId, table.memberId, table.meetingDate),
  }
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  meetingDate: text("meeting_date"),
  recordedBy: text("recorded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  memberId: integer("member_id").references(() => members.id, { onDelete: "set null" }),
  actionType: text("action_type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});