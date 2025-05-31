const job = require('../../handlers/auth/handler');

module.exports = function (fastify, opts, next) {
    fastify.route({
        method: 'POST',
        url:    '/',
        schema: {
            body: {
                type:       'object',
                properties: {
                    login:    {
                        type: 'string',
                    },
                    password: {
                        type: 'string',
                    },
                },
            },
        },
        async handler(request, reply) {
            const data = await job.auth(request.body);
            
            if (data.statusCode !== 200) {
                reply.code(data.statusCode);
            }
            
            reply.send(data);
        },
    });
    
    next();
};

module.exports.autoPrefix = process.env.API + 'auth';