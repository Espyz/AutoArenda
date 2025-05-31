const { winston, checkTokenAndSetReq } = require('../../dependes');
const job = require('../../handlers/rentals/handler');

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
                    page:   { type: 'integer' },
                    limit:  { type: 'integer' },
                    userId: { type: 'integer' },
                    carId:  { type: 'integer' },
                    status: { type: 'string' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.getRentals(request.query, request.info);
            
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
            const data = await job.getRentalById(request.params, request.info);
            
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
                properties: {
                    userId:    { type: 'integer' },
                    carId:     { type: 'integer' },
                    startDate: { type: 'string' },
                    endDate:   { type: 'string' },
                    status:    { type: 'string' },
                },
                required:   [ 'userId', 'carId', 'startDate', 'endDate' ],
            },
        },
        async handler(request, reply) {
            const data = await job.createRental(request.body, request.info);
            
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
                    userId:    { type: 'integer' },
                    carId:     { type: 'integer' },
                    startDate: { type: 'string', format: 'date' },
                    endDate:   { type: 'string', format: 'date' },
                    totalCost: { type: 'number' },
                    status:    { type: 'string' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.updateRental({ ...request.params, ...request.body }, request.info);
            
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
            const data = await job.deleteRental(request.params, request.info);
            
            if (data.statusCode !== 200) {
                reply.code(data.statusCode);
            }
            
            reply.send(data);
        },
    });
    
    next();
};

module.exports.autoPrefix = process.env.API + 'rentals';