const { winston, checkTokenAndSetReq } = require('../../dependes');
const job = require('../../handlers/reviews/handler');

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
                    carId:  { type: 'integer' },
                    userId: { type: 'integer' },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.getReviews(request.query, request.info);
            
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
            const data = await job.getReviewById(request.params, request.info);
            
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
                    carId:   { type: 'integer' },
                    rating:  { type: 'integer' },
                    comment: { type: 'string' },
                },
                required:   [ 'carId', 'rating' ],
            },
        },
        async handler(request, reply) {
            const data = await job.createReview(request.body, request.info);
            
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
                    rating:  { type: 'integer' },
                    comment: { type: 'string' },
                },
                required:   [ 'rating', 'comment' ],
            },
        },
        async handler(request, reply) {
            const data = await job.updateReview({ ...request.params, ...request.body }, request.info);
            
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
            const data = await job.deleteReview(request.params, request.info);
            
            if (data.statusCode !== 200) {
                reply.code(data.statusCode);
            }
            
            reply.send(data);
        },
    });
    
    next();
};

module.exports.autoPrefix = process.env.API + 'reviews';
