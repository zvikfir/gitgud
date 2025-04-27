import { describe, it, expect, beforeAll } from 'vitest';
import { setupTestApp } from './setup';

let request: any; // Will hold the supertest agent

describe('Stacks API', () => {
  beforeAll(async () => {
    // Setup the app and get the supertest request agent
    request = await setupTestApp();
  });

  describe('GET /api/stacks', () => {
    it('should return a list of stacks', async () => {
      const res = await request.get('/api/stacks');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.results)).toBe(true);
      // Add more specific assertions based on expected data structure
    });
  });

  describe('POST /api/stacks', () => {
    it('should create a new stack', async () => {
      const newStack = {
        label: `Test Stack ${Date.now()}`,
        // Add other required fields for stack creation
      };
      const res = await request.post('/api/stacks').send(newStack);
      expect(res.status).toBe(200); // Or 201 if that's what your API returns
      expect(res.body.status).toBe('ok');
      expect(res.body.result).toHaveProperty('id');
      expect(res.body.result.label).toBe(newStack.label);

      // Optionally, verify it exists with a GET request
      const getRes = await request.get(`/api/stacks/${res.body.result.id}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.result.label).toBe(newStack.label);
    });

    // Add tests for invalid input, duplicate labels, etc.
  });

  describe('GET /api/stacks/:id', () => {
    it('should return a specific stack by id', async () => {
      // Pre-requisite: Create a stack first or use a known ID
      const createRes = await request.post('/api/stacks').send({ label: `Fetchable Stack ${Date.now()}` });
      const stackId = createRes.body.result.id;

      const res = await request.get(`/api/stacks/${stackId}`);
      expect(res.status).toBe(200);
      expect(res.body.result).toHaveProperty('id', stackId);
      expect(res.body.result.label).toContain('Fetchable Stack');
    });

    it('should return 404 for a non-existent stack id', async () => {
      const nonExistentId = 'non-existent-id-12345';
      const res = await request.get(`/api/stacks/${nonExistentId}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/stacks/:id', () => {
    it('should update an existing stack', async () => {
      // Pre-requisite: Create a stack first
      const createRes = await request.post('/api/stacks').send({ label: `Updateable Stack ${Date.now()}` });
      const stackId = createRes.body.result.id;

      const updatedData = {
        label: `Updated Stack ${Date.now()}`,
        // Add other fields to update
      };

      const res = await request.put(`/api/stacks/${stackId}`).send(updatedData);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.result.label).toBe(updatedData.label);

      // Optionally, verify the update with a GET request
      const getRes = await request.get(`/api/stacks/${stackId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.result.label).toBe(updatedData.label);
    });

    it('should return 404 when trying to update a non-existent stack', async () => {
      const nonExistentId = 'non-existent-id-67890';
      const res = await request.put(`/api/stacks/${nonExistentId}`).send({ label: 'Won\'t Update' });
      expect(res.status).toBe(404);
    });

    // Add tests for invalid update data
  });

  describe('DELETE /api/stacks/:id', () => {
    it('should delete an existing stack', async () => {
      // Pre-requisite: Create a stack first
      const createRes = await request.post('/api/stacks').send({ label: `Deleteable Stack ${Date.now()}` });
      const stackId = createRes.body.result.id;

      const res = await request.delete(`/api/stacks/${stackId}`);
      expect(res.status).toBe(200); // Or 204 if no content is returned
      expect(res.body.status).toBe('ok');

      // Optionally, verify it's gone with a GET request
      const getRes = await request.get(`/api/stacks/${stackId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 when trying to delete a non-existent stack', async () => {
      const nonExistentId = 'non-existent-id-abcde';
      const res = await request.delete(`/api/stacks/${nonExistentId}`);
      expect(res.status).toBe(404);
    });
  });

  // Add more tests as needed, e.g., for pagination, filtering, specific error cases.
});
