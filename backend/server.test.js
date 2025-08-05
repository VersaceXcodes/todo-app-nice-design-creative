import request from 'supertest';
import { app, pool } from './server.ts'; // import your Express app and database pool

beforeAll(async () => {
  // Logic to setup database connection and prepare the environment, such as running migrations
});

afterAll(async () => {
  // Logic to teardown database connection
  await pool.end(); // ensure the database connection pool is closed
});

describe('User Authentication', () => {
  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'new.user@example.com',
          name: 'New User',
          password_hash: 'plainpassword' // plaintext password for testing
        })
        .expect(201);

      expect(response.body).toHaveProperty('auth_token');
      expect(response.body.user.email).toBe('new.user@example.com');
    });

    it('should fail to register a user with an existing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'john.doe@example.com',
          name: 'Duplicate User',
          password_hash: 'plainpassword'
        })
        .expect(400);

      expect(response.body.error).toBe('Email already exists.');
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123' // plaintext password for testing
        })
        .expect(200);

      expect(response.body).toHaveProperty('auth_token');
    });

    it('should fail to login with incorrect credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials.');
    });
  });

  describe('POST /auth/recover', () => {
    it('should send a recovery email to an existing user', async () => {
      // Mock email service call if any
      const response = await request(app)
        .post('/auth/recover')
        .send({
          email: 'john.doe@example.com'
        })
        .expect(200);

      expect(response.body.message).toBe('Recovery email sent.');
    });

    it('should not send a recovery email to a non-existing user', async () => {
      const response = await request(app)
        .post('/auth/recover')
        .send({
          email: 'non.existent@example.com'
        })
        .expect(404);

      expect(response.body.error).toBe('Email not found.');
    });
  });
});

describe('Task Management', () => {
  let authToken, userId;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        email: 'task.user@example.com',
        name: 'Task User',
        password_hash: 'taskpassword'
      });

    authToken = registerResponse.body.auth_token;
    userId = registerResponse.body.user.user_id;
  });

  describe('POST /tasks', () => {
    it('should create a new task with valid data', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userId,
          name: 'Test Task',
          description: 'A test task description',
          priority: 'high'
        })
        .expect(201);

      expect(response.body.user_id).toBe(userId);
      expect(response.body.name).toBe('Test Task');
    });
  });

  describe('GET /tasks', () => {
    it('should retrieve tasks for a user', async () => {
      const response = await request(app)
        .get(`/tasks?user_id=${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /tasks/{task_id}', () => {
    let taskId;

    beforeAll(async () => {
      const createTaskResponse = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userId,
          name: 'Another Task',
          priority: 'medium'
        });

      taskId = createTaskResponse.body.task_id;
    });

    it('should update the task details', async () => {
      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Task Name',
          priority: 'low'
        })
        .expect(200);

      expect(response.body.name).toBe('Updated Task Name');
      expect(response.body.priority).toBe('low');
    });
  });

  describe('DELETE /tasks/{task_id}', () => {
    let taskId;

    beforeEach(async () => {
      const createTaskResponse = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          user_id: userId,
          name: 'Task to Delete',
          priority: 'low'
        });

      taskId = createTaskResponse.body.task_id;
    });

    it('should delete a task', async () => {
      await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const response = await request(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Task not found.');
    });
  });
});

// More tests can be added for categories, task reminders, and other entities similarly.