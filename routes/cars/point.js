const { winston, checkTokenAndSetReq } = require('../../dependes');
const job = require('../../handlers/cars/handler');

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
                    page:    { type: 'integer' },
                    limit:   { type: 'integer' },
                    type:    { type: 'string' },
                    minYear: { type: 'integer' },
                    maxYear: { type: 'integer' },
                    status:  { type: 'string' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.getCars(request.query);
            
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
            const data = await job.getCarById(request.params);
            
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
                    brand:      { type: 'string' },
                    model:      { type: 'string' },
                    year:       { type: 'integer' },
                    type:       { type: 'string' },
                    dailyPrice: { type: 'number' },
                    status:     { type: 'string' },
                },
                required:   [ 'brand', 'model', 'year', 'type', 'dailyPrice' ],
            },
        },
        async handler(request, reply) {
            const data = await job.createCar(request.body, request.info);
            
            if (data.statusCode !== 201) {
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
                    brand:    { type: 'string' },
                    model:    { type: 'string' },
                    year:     { type: 'integer' },
                    type:     { type: 'string' },
                    dayPrice: { type: 'number' },
                    status:   { type: 'string' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.updateCar({ ...request.params, ...request.body }, request.info);
            
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
            const data = await job.deleteCar(request.params, request.info);
            
            if (data.statusCode !== 204) {
                reply.code(data.statusCode);
            }
            
            reply.send(data);
        },
    });
    
    next();
};

module.exports.autoPrefix = process.env.API + 'cars';
