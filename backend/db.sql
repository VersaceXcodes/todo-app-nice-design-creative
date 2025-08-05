-- Creating 'users' table
CREATE TABLE users (
    user_id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    password_hash VARCHAR NOT NULL,
    created_at VARCHAR NOT NULL
);

-- Creating 'user_preferences' table
CREATE TABLE user_preferences (
    user_id VARCHAR PRIMARY KEY,
    theme VARCHAR NOT NULL DEFAULT 'light',
    default_view VARCHAR NOT NULL DEFAULT 'list',
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- Creating 'tasks' table
CREATE TABLE tasks (
    task_id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    description VARCHAR,
    due_date VARCHAR,
    priority VARCHAR NOT NULL DEFAULT 'low',
    category_id VARCHAR,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at VARCHAR NOT NULL,
    updated_at VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (category_id) REFERENCES categories (category_id)
);

-- Creating 'task_reminders' table
CREATE TABLE task_reminders (
    reminder_id VARCHAR PRIMARY KEY,
    task_id VARCHAR NOT NULL,
    reminder_time VARCHAR NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks (task_id)
);

-- Creating 'categories' table
CREATE TABLE categories (
    category_id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    color_code VARCHAR NOT NULL,
    created_at VARCHAR NOT NULL,
    updated_at VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- Seeding 'users' table
INSERT INTO users (user_id, email, name, password_hash, created_at) VALUES
('user_1', 'john.doe@example.com', 'John Doe', 'password123', '2023-01-01T10:00:00Z'),
('user_2', 'jane.smith@example.com', 'Jane Smith', 'admin123', '2023-01-02T11:00:00Z'),
('user_3', 'alice.jones@example.com', 'Alice Jones', 'user123', '2023-01-03T12:00:00Z');

-- Seeding 'user_preferences' table
INSERT INTO user_preferences (user_id, theme, default_view, email_notifications, in_app_notifications) VALUES
('user_1', 'dark', 'grid', TRUE, FALSE),
('user_2', 'light', 'list', FALSE, TRUE),
('user_3', 'dark', 'list', TRUE, TRUE);

-- Seeding 'categories' table
INSERT INTO categories (category_id, user_id, name, color_code, created_at, updated_at) VALUES
('cat_1', 'user_1', 'Work', '#FF5733', '2023-01-01T10:05:00Z', '2023-01-01T10:05:00Z'),
('cat_2', 'user_1', 'Personal', '#33FF57', '2023-01-01T10:15:00Z', '2023-01-01T10:15:00Z'),
('cat_3', 'user_2', 'Groceries', '#3357FF', '2023-01-02T11:20:00Z', '2023-01-02T11:20:00Z');

-- Seeding 'tasks' table
INSERT INTO tasks (task_id, user_id, name, description, due_date, priority, category_id, is_completed, created_at, updated_at) VALUES
('task_1', 'user_1', 'Finish report', 'Complete the annual report', '2023-01-10', 'high', 'cat_1', FALSE, '2023-01-01T10:20:00Z', '2023-01-01T10:20:00Z'),
('task_2', 'user_1', 'Buy groceries', 'Milk, Bread, Cheese', '2023-01-11', 'medium', 'cat_2', FALSE, '2023-01-01T11:20:00Z', '2023-01-01T11:20:00Z'),
('task_3', 'user_2', 'Plan meeting', 'Schedule project kickoff', '2023-01-12', 'high', NULL, FALSE, '2023-01-02T11:30:00Z', '2023-01-02T11:30:00Z');

-- Seeding 'task_reminders' table
INSERT INTO task_reminders (reminder_id, task_id, reminder_time) VALUES
('rem_1', 'task_1', '2023-01-09T08:00:00Z'),
('rem_2', 'task_2', '2023-01-10T08:00:00Z'),
('rem_3', 'task_3', '2023-01-11T08:00:00Z');