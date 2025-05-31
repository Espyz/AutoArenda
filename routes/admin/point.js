const { winston, checkTokenAndSetReq, constants } = require('../../dependes');
const job = require('../../handlers/admin/handler');

module.exports = function (fastify, opts, next) {
    fastify.addHook('preHandler', async (request, reply) => {
        try {
            let ch = await checkTokenAndSetReq(request);
            
            if (ch.check) {
                if (ch.isExpired) {
                    reply.code(403);
                    reply.send({ 'message': 'Token expired', 'statusCode': 403 });
                    return;
                }
                
                if (request.info.userRole !== constants.userRole.admin) {
                    reply.code(403);
                    reply.send({ 'message': 'Access denied', 'statusCode': 403 });
                    return;
                }
            }
            else {
                reply.code(403);
                reply.send({ 'message': 'Access denied', 'statusCode': 403 });
                return;
            }
            
            winston.info(ch);
            winston.info(request.info);
        }
        catch (e) {
            winston.error(e);
        }
    });
    
    fastify.route({
        method: 'GET',
        url:    '/',
        schema: {
            querystring: {
                type:       'object',
                properties: {
                    page:  { type: 'integer' },
                    limit: { type: 'integer' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.getUsers(request.query, request.info);
            
            if (data.statusCode !== 200) {
                reply.code(data.statusCode);
            }
            
            reply.send(data);
        },
    });
    
    fastify.route({
        method: 'GET',
        url:    '/:id',
        schema: {
            params: {
                type:       'object',
                properties: {
                    id: { type: 'integer' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.getUserById(request.params, request.info);
            
            if (data.statusCode !== 200) {
                reply.code(data.statusCode);
            }
            
            reply.send(data);
        },
    });
    
    fastify.route({
        method: 'POST',
        url:    '/',
        schema: {
            body: {
                type:       'object',
                required:   [ 'login', 'password', 'role' ],
                properties: {
                    login:    { type: 'string' },
                    password: { type: 'string' },
                    role:     { type: 'string' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.createUser(request.body, request.info);
            
            if (data.statusCode !== 200) {
                reply.code(data.statusCode);
            }
            
            reply.send(data);
        },
    });
    
    fastify.route({
        method: 'PUT',
        url:    '/:id',
        schema: {
            params: {
                type:       'object',
                properties: {
                    id: { type: 'integer' },
                },
            },
            body:   {
                type:       'object',
                properties: {
                    login:    { type: 'string' },
                    password: { type: 'string' },
                    role:     { type: 'string' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.updateUser({ ...request.params, ...request.body }, request.info);
            
            if (data.statusCode !== 200) {
                reply.code(data.statusCode);
            }
            
            reply.send(data);
        },
    });
    
    fastify.route({
        method: 'DELETE',
        url:    '/:id',
        schema: {
            params: {
                type:       'object',
                properties: {
                    id: { type: 'integer' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.deleteUser(request.params, request.info);
            
            if (data.statusCode !== 200) {
                reply.code(data.statusCode);
            }
            
            reply.send(data);
        },
    });
    
    next();
};

module.exports.autoPrefix = process.env.API + 'admin';