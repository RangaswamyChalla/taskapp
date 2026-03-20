const request = require('supertest');
const app = require('../server');

describe('Task Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'taskuser@example.com',
        password: 'password123',
        name: 'Task User'
      });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'taskuser@example.com',
        password: 'password123'
      });

    token = loginRes.body.token;
    userId = loginRes.body.user.id;
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          priority: 'high'
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Task');
      expect(res.body.priority).toBe('high');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({
          title: 'Unauthorized Task'
        });

      expect(res.status).toBe(401);
    });

    it('should require title', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'No title task'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /tasks', () => {
    it('should list user tasks', async () => {
      const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tasks');
      expect(Array.isArray(res.body.tasks)).toBe(true);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/tasks');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /tasks/:id', () => {
    let taskId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Update Test Task',
          priority: 'low'
        });

      taskId = res.body.id;
    });

    it('should update task status', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'in_progress'
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('in_progress');
    });

    it('should update task priority', async () => {
      const res = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          priority: 'urgent'
        });

      expect(res.status).toBe(200);
      expect(res.body.priority).toBe('urgent');
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Delete Test Task'
        });

      taskId = res.body.id;
    });

    it('should delete task', async () => {
      const res = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});
