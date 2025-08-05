import { z } from 'zod';

// Users Entity Schema
export const userSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  name: z.string(),
  password_hash: z.string(),
  created_at: z.coerce.date()
});

// Users Input Schema for creation
export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password_hash: z.string(),
  // Do not include user_id or created_at (auto-generated)
});

// Users Input Schema for updates
export const updateUserInputSchema = z.object({
  user_id: z.string(),
  email: z.string().email().optional(),
  name: z.string().min(1).max(255).optional(),
  password_hash: z.string().optional(),
});

// Users Search/Query Schema
export const searchUserInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// User Preferences Entity Schema
export const userPreferenceSchema = z.object({
  user_id: z.string(),
  theme: z.string(),
  default_view: z.string(),
  email_notifications: z.boolean(),
  in_app_notifications: z.boolean(),
});

// User Preferences Input Schema for creation
export const createUserPreferenceInputSchema = z.object({
  user_id: z.string(),
  theme: z.string().default('light'),
  default_view: z.string().default('list'),
  email_notifications: z.boolean().default(true),
  in_app_notifications: z.boolean().default(true),
});

// User Preferences Input Schema for updates
export const updateUserPreferenceInputSchema = z.object({
  user_id: z.string(),
  theme: z.string().optional(),
  default_view: z.string().optional(),
  email_notifications: z.boolean().optional(),
  in_app_notifications: z.boolean().optional(),
});

// User Preferences Search/Query Schema
export const searchUserPreferenceInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['theme', 'default_view']).default('theme'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Tasks Entity Schema
export const taskSchema = z.object({
  task_id: z.string(),
  user_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  due_date: z.coerce.date().nullable(),
  priority: z.string(),
  category_id: z.string().nullable(),
  is_completed: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

// Tasks Input Schema for creation
export const createTaskInputSchema = z.object({
  user_id: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  due_date: z.coerce.date().nullable().optional(),
  priority: z.string().default('low'),
  category_id: z.string().nullable().optional(),
  is_completed: z.boolean().default(false),
  // Do not include task_id, created_at or updated_at (auto-generated)
});

// Tasks Input Schema for updates
export const updateTaskInputSchema = z.object({
  task_id: z.string(),
  user_id: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  due_date: z.coerce.date().nullable().optional(),
  priority: z.string().optional(),
  category_id: z.string().nullable().optional(),
  is_completed: z.boolean().optional(),
  updated_at: z.coerce.date().optional() // can be manually updated if needed
});

// Tasks Search/Query Schema
export const searchTaskInputSchema = z.object({
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name', 'due_date', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  is_completed: z.boolean().optional()
});

// Task Reminders Entity Schema
export const taskReminderSchema = z.object({
  reminder_id: z.string(),
  task_id: z.string(),
  reminder_time: z.coerce.date()
});

// Task Reminders Input Schema for creation
export const createTaskReminderInputSchema = z.object({
  task_id: z.string(),
  reminder_time: z.coerce.date(),
  // Do not include reminder_id (auto-generated)
});

// Task Reminders Input Schema for updates
export const updateTaskReminderInputSchema = z.object({
  reminder_id: z.string(),
  task_id: z.string().optional(),
  reminder_time: z.coerce.date().optional(),
});

// Task Reminders Search/Query Schema
export const searchTaskReminderInputSchema = z.object({
  task_id: z.string().optional(),
  reminder_time: z.coerce.date().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0)
});

// Categories Entity Schema
export const categorySchema = z.object({
  category_id: z.string(),
  user_id: z.string(),
  name: z.string(),
  color_code: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

// Categories Input Schema for creation
export const createCategoryInputSchema = z.object({
  user_id: z.string(),
  name: z.string().min(1).max(255),
  color_code: z.string(),
  // Do not include category_id, created_at or updated_at (auto-generated)
});

// Categories Input Schema for updates
export const updateCategoryInputSchema = z.object({
  category_id: z.string(),
  user_id: z.string().optional(),
  name: z.string().min(1).max(255).optional(),
  color_code: z.string().optional(),
  updated_at: z.coerce.date().optional() // can be manually updated if needed
});

// Categories Search/Query Schema
export const searchCategoryInputSchema = z.object({
  user_id: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['name', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Inferred types
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUserInput = z.infer<typeof searchUserInputSchema>;

export type UserPreference = z.infer<typeof userPreferenceSchema>;
export type CreateUserPreferenceInput = z.infer<typeof createUserPreferenceInputSchema>;
export type UpdateUserPreferenceInput = z.infer<typeof updateUserPreferenceInputSchema>;
export type SearchUserPreferenceInput = z.infer<typeof searchUserPreferenceInputSchema>;

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type SearchTaskInput = z.infer<typeof searchTaskInputSchema>;

export type TaskReminder = z.infer<typeof taskReminderSchema>;
export type CreateTaskReminderInput = z.infer<typeof createTaskReminderInputSchema>;
export type UpdateTaskReminderInput = z.infer<typeof updateTaskReminderInputSchema>;
export type SearchTaskReminderInput = z.infer<typeof searchTaskReminderInputSchema>;

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;
export type SearchCategoryInput = z.infer<typeof searchCategoryInputSchema>;