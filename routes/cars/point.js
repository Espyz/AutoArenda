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
                    page:    {
                        type: 'integer',
                    },
                    limit:   {
                        type: 'integer',
                    },
                    type:    {
                        type: 'string',
                    },
                    minYear: {
                        type: 'integer',
                    },
                    maxYear: {
                        type: 'integer',
                    },
                    status:  {
                        type: 'string',
                    },
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
    
    next();
};

module.exports.autoPrefix = process.env.API + 'cars';