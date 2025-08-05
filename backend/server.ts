import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pkg from 'pg';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import {
  userSchema,
  createUserInputSchema,
  updateUserInputSchema,
  userPreferenceSchema,
  createUserPreferenceInputSchema,
  updateUserPreferenceInputSchema,
  taskSchema,
  createTaskInputSchema,
  updateTaskInputSchema,
  taskReminderSchema,
  createTaskReminderInputSchema,
  updateTaskReminderInputSchema,
  categorySchema,
  createCategoryInputSchema,
  updateCategoryInputSchema,
} from './schema.ts';

// Load environment variables
dotenv.config();

// Database connection setup
const { Pool } = pkg;
const {
  DATABASE_URL,
  PGHOST,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
  PGPORT = 5432,
  JWT_SECRET = 'your-secret-key',
} = process.env;

const pool = new Pool(
  DATABASE_URL
    ? {
        connectionString: DATABASE_URL,
        ssl: { require: true },
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { require: true },
      }
);

const app = express();
const port = process.env.PORT || 3000;

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('combined'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to generate JWT
function generateToken(user) {
  return jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

// Helper middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    pool.query('SELECT * FROM users WHERE user_id = $1', [decoded.user_id], (err, result) => {
      if (err || result.rows.length === 0) return res.status(401).json({ message: 'Invalid token' });
      req.user = result.rows[0];
      next();
    });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Endpoint: Register a new user
app.post('/auth/register', async (req, res) => {
  try {
    const input = createUserInputSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await pool.query('SELECT user_id FROM users WHERE email = $1', [input.email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Insert new user
    const user_id = uuidv4();
    await pool.query(
      `INSERT INTO users (user_id, email, name, password_hash, created_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, input.email, input.name, input.password_hash, new Date().toISOString()]
    );

    const newUser = {
      user_id,
      email: input.email,
      name: input.name,
      password_hash: input.password_hash,
      created_at: new Date().toISOString(),
    };

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({ auth_token: token, user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Login user
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0 || result.rows[0].password_hash !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const token = generateToken(user);

    res.json({ auth_token: token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @@need:external-api: Email service to send password recovery emails
async function sendRecoveryEmail(email) {
  // Mock function returning a response as if the email was sent
  return { message: `Recovery email sent to ${email}` };
}

// Endpoint: Recover password
app.post('/auth/recover', async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query('SELECT email FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Invoke mock email function
    const recoveryMessage = await sendRecoveryEmail(email);

    res.json(recoveryMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Get user profile
app.get('/users/:user_id', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Update user profile
app.put('/users/:user_id', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.params;
    const input = updateUserInputSchema.parse(req.body);

    const updateFields = ['email', 'name', 'password_hash'].filter(
      (field) => input[field] !== undefined
    );
    const setFields = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    if (setFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const values = [user_id, ...updateFields.map((field) => input[field])];

    const result = await pool.query(`UPDATE users SET ${setFields} WHERE user_id = $1 RETURNING *`, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Get user preferences
app.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const { user_id } = req.query;

    const result = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Update user preferences
app.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const input = updateUserPreferenceInputSchema.parse(req.body);

    const updateFields = ['theme', 'default_view', 'email_notifications', 'in_app_notifications'].filter(
      (field) => input[field] !== undefined
    );
    const setFields = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    if (setFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const values = [input.user_id, ...updateFields.map((field) => input[field])];

    const result = await pool.query(
      `UPDATE user_preferences SET ${setFields} WHERE user_id = $1 RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Create a new task
app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const input = createTaskInputSchema.parse(req.body);

    const task_id = uuidv4();
    const created_at = new Date().toISOString();

    await pool.query(
      `INSERT INTO tasks (task_id, user_id, name, description, due_date, priority, category_id, is_completed, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [task_id, input.user_id, input.name, input.description, input.due_date, input.priority, input.category_id, input.is_completed, created_at, created_at]
    );

    const newTask = {
      task_id,
      user_id: input.user_id,
      name: input.name,
      description: input.description,
      due_date: input.due_date,
      priority: input.priority,
      category_id: input.category_id,
      is_completed: input.is_completed,
      created_at,
      updated_at: created_at,
    };

    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Get list of tasks
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const { user_id, query, limit = 10, offset = 0, sort_by = 'created_at', sort_order = 'desc', priority, is_completed } = req.query;

    let sql = `SELECT * FROM tasks WHERE user_id = $1`;
    let count = 2;
    const params = [user_id];

    if (query) {
      sql += ` AND name LIKE $${count}`;
      params.push(`%${query}%`);
      count++;
    }

    if (priority) {
      sql += ` AND priority = $${count}`;
      params.push(priority);
      count++;
    }

    if (is_completed !== undefined) {
      sql += ` AND is_completed = $${count}`;
      params.push(is_completed);
      count++;
    }

    sql += ` ORDER BY ${sort_by} ${sort_order} LIMIT ${limit} OFFSET ${offset}`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Get task details
app.get('/tasks/:task_id', authenticateToken, async (req, res) => {
  try {
    const { task_id } = req.params;

    const result = await pool.query('SELECT * FROM tasks WHERE task_id = $1', [task_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Update a task
app.put('/tasks/:task_id', authenticateToken, async (req, res) => {
  try {
    const { task_id } = req.params;
    const input = updateTaskInputSchema.parse(req.body);

    const updateFields = ['user_id', 'name', 'description', 'due_date', 'priority', 'category_id', 'is_completed'].filter(
      (field) => input[field] !== undefined
    );
    const setFields = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    if (setFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const values = [task_id, ...updateFields.map((field) => input[field])];

    const result = await pool.query(`UPDATE tasks SET ${setFields} WHERE task_id = $1 RETURNING *`, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Delete a task
app.delete('/tasks/:task_id', authenticateToken, async (req, res) => {
  try {
    const { task_id } = req.params;

    const result = await pool.query('DELETE FROM tasks WHERE task_id = $1 RETURNING *', [task_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Create a new category
app.post('/categories', authenticateToken, async (req, res) => {
  try {
    const input = createCategoryInputSchema.parse(req.body);

    const category_id = uuidv4();
    const created_at = new Date().toISOString();

    await pool.query(
      `INSERT INTO categories (category_id, user_id, name, color_code, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [category_id, input.user_id, input.name, input.color_code, created_at, created_at]
    );

    const newCategory = {
      category_id,
      user_id: input.user_id,
      name: input.name,
      color_code: input.color_code,
      created_at,
      updated_at: created_at,
    };

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Get list of categories
app.get('/categories', authenticateToken, async (req, res) => {
  try {
    const { user_id, query, limit = 10, offset = 0, sort_by = 'created_at', sort_order = 'desc' } = req.query;

    let sql = `SELECT * FROM categories WHERE user_id = $1`;
    let count = 2;
    const params = [user_id];

    if (query) {
      sql += ` AND name LIKE $${count}`;
      params.push(`%${query}%`);
      count++;
    }

    sql += ` ORDER BY ${sort_by} ${sort_order} LIMIT ${limit} OFFSET ${offset}`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Get category details
app.get('/categories/:category_id', authenticateToken, async (req, res) => {
  try {
    const { category_id } = req.params;

    const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [category_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Update a category
app.put('/categories/:category_id', authenticateToken, async (req, res) => {
  try {
    const { category_id } = req.params;
    const input = updateCategoryInputSchema.parse(req.body);

    const updateFields = ['user_id', 'name', 'color_code'].filter(
      (field) => input[field] !== undefined
    );
    const setFields = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    if (setFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const values = [category_id, ...updateFields.map((field) => input[field])];

    const result = await pool.query(`UPDATE categories SET ${setFields} WHERE category_id = $1 RETURNING *`, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Delete a category
app.delete('/categories/:category_id', authenticateToken, async (req, res) => {
  try {
    const { category_id } = req.params;

    const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [category_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Create a task reminder
app.post('/task_reminders', authenticateToken, async (req, res) => {
  try {
    const input = createTaskReminderInputSchema.parse(req.body);

    const reminder_id = uuidv4();

    await pool.query(
      `INSERT INTO task_reminders (reminder_id, task_id, reminder_time) 
       VALUES ($1, $2, $3)`,
      [reminder_id, input.task_id, input.reminder_time]
    );

    const newReminder = {
      reminder_id,
      task_id: input.task_id,
      reminder_time: input.reminder_time,
    };

    res.status(201).json(newReminder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Get list of task reminders
app.get('/task_reminders', authenticateToken, async (req, res) => {
  try {
    const { task_id, reminder_time, limit = 10, offset = 0 } = req.query;

    let sql = `SELECT * FROM task_reminders WHERE 1=1`;
    let count = 1;
    const params = [];

    if (task_id) {
      sql += ` AND task_id = $${count}`;
      params.push(task_id);
      count++;
    }

    if (reminder_time) {
      sql += ` AND reminder_time = $${count}`;
      params.push(reminder_time);
      count++;
    }

    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Update a task reminder
app.put('/task_reminders/:reminder_id', authenticateToken, async (req, res) => {
  try {
    const { reminder_id } = req.params;
    const input = updateTaskReminderInputSchema.parse(req.body);

    const updateFields = ['task_id', 'reminder_time'].filter(
      (field) => input[field] !== undefined
    );
    const setFields = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    if (setFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const values = [reminder_id, ...updateFields.map((field) => input[field])];

    const result = await pool.query(`UPDATE task_reminders SET ${setFields} WHERE reminder_id = $1 RETURNING *`, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Endpoint: Delete a task reminder
app.delete('/task_reminders/:reminder_id', authenticateToken, async (req, res) => {
  try {
    const { reminder_id } = req.params;

    const result = await pool.query('DELETE FROM task_reminders WHERE reminder_id = $1 RETURNING *', [reminder_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Server running with authentication' });
});

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export { app, pool };

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} and listening on 0.0.0.0`);
});