const { app } = require('@azure/functions');
const database = require('../shared/database');
const auth = require('../shared/auth');

// GET /api/tasks - Get all tasks for authenticated user
app.http('getTasks', {
    methods: ['GET'],
    route: 'tasks',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const userId = auth.requireAuth(request);
            const tasks = await database.findByUserId('tasks', userId);
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(tasks)
            };
        } catch (error) {
            context.error('Error fetching tasks:', error);
            return {
                status: error.message.includes('Authentication') ? 401 : 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});

// POST /api/tasks - Create new task
app.http('createTask', {
    methods: ['POST'],
    route: 'tasks',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const userId = auth.requireAuth(request);
            const taskData = await request.json();
            
            const { title, dueDate, status = 'pending' } = taskData;
            if (!title || !dueDate) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'Title and due date are required' })
                };
            }

            // Validate status
            const validStatuses = ['pending', 'in-progress', 'completed'];
            if (!validStatuses.includes(status)) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'Invalid status value' })
                };
            }

            const task = await database.create('tasks', {
                userId,
                title: title.trim(),
                dueDate: new Date(dueDate),
                status
            });

            return {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(task)
            };
        } catch (error) {
            context.error('Error creating task:', error);
            return {
                status: error.message.includes('Authentication') ? 401 : 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});

// PUT /api/tasks/{id} - Update task
app.http('updateTask', {
    methods: ['PUT'],
    route: 'tasks/{id}',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const userId = auth.requireAuth(request);
            const taskId = request.params.id;
            const updateData = await request.json();

            const { title, dueDate, status } = updateData;
            
            const updateFields = {};
            if (title) updateFields.title = title.trim();
            if (dueDate) updateFields.dueDate = new Date(dueDate);
            if (status) {
                const validStatuses = ['pending', 'in-progress', 'completed'];
                if (!validStatuses.includes(status)) {
                    return {
                        status: 400,
                        body: JSON.stringify({ error: 'Invalid status value' })
                    };
                }
                updateFields.status = status;
            }

            if (Object.keys(updateFields).length === 0) {
                return {
                    status: 400,
                    body: JSON.stringify({ error: 'No valid fields to update' })
                };
            }

            const success = await database.updateById('tasks', taskId, userId, updateFields);

            if (!success) {
                return {
                    status: 404,
                    body: JSON.stringify({ error: 'Task not found' })
                };
            }

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ message: 'Task updated successfully' })
            };
        } catch (error) {
            context.error('Error updating task:', error);
            return {
                status: error.message.includes('Authentication') ? 401 : 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});

// DELETE /api/tasks/{id} - Delete task
app.http('deleteTask', {
    methods: ['DELETE'],
    route: 'tasks/{id}',
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const userId = auth.requireAuth(request);
            const taskId = request.params.id;

            const success = await database.deleteById('tasks', taskId, userId);

            if (!success) {
                return {
                    status: 404,
                    body: JSON.stringify({ error: 'Task not found' })
                };
            }

            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ message: 'Task deleted successfully' })
            };
        } catch (error) {
            context.error('Error deleting task:', error);
            return {
                status: error.message.includes('Authentication') ? 401 : 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
});

// File: package.json
{
  "name": "pim-azure-functions",
  "version": "1.0.0",
  "description": "Azure Functions backend for Personal Information Management app",
  "main": "src/index.js",
  "scripts": {
    "start": "func start",
    "test": "echo \"No tests yet...\" && exit 0"
  },
  "dependencies": {
    "@azure/functions": "^3.0.0",
    "mongodb": "^6.0.0",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "@types/node": "^18.x"
  }
}