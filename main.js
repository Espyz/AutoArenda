const path = require('path');
require('dotenv').config();
const fastifyMultipart = require('fastify-multipart');
const fastifyAutoload = require('fastify-autoload');
const fastifyCookie = require('fastify-cookie');

const options = {
    addToBody:      true,
    sharedSchemaId: 'MultipartFileType',
};

const fastify = require('fastify')({
    logger: true,
});

fastify.register(fastifyMultipart, options);

fastify.register(fastifyAutoload, {
    dir: path.join(__dirname, './routes'),
});

fastify.register(fastifyCookie, {
    secret:       process.env.COOKIE_SECRET,
    parseOptions: {},
});

fastify.addHook('onRequest', (req, reply, done) => {
    try {
        req.log.info({
            url:     req.raw.url,
            id:      req.id,
            headers: {
                access:               req.headers.access,
                profile:              req.headers.profile,
                fingerprint:          req.headers.fingerprint,
                host:                 req.headers.host,
                referer:              req.headers.referer,
                'user-agent':         req.headers['user-agent'],
                'x-forwarded-for':    req.headers['x-forwarded-for'],
                'x-real-ip':          req.headers['x-real-ip'],
                'sec-ch-ua':          req.headers['sec-ch-ua'],
                'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'],
                'sec-ch-ua-mobile':   req.headers['sec-ch-ua-mobile'],
            },
        }, 'log for check headers of users');
        
        // если не браузерные user-agent'ы, блокируем доступ
        if (/ReactorNetty/.test(req.headers['user-agent'])) {
            req.log.error({
                url:     req.raw.url,
                id:      req.id,
                headers: {
                    access:               req.headers.access,
                    profile:              req.headers.profile,
                    fingerprint:          req.headers.fingerprint,
                    host:                 req.headers.host,
                    referer:              req.headers.referer,
                    'user-agent':         req.headers['user-agent'],
                    'x-forwarded-for':    req.headers['x-forwarded-for'],
                    'x-real-ip':          req.headers['x-real-ip'],
                    'sec-ch-ua':          req.headers['sec-ch-ua'],
                    'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'],
                    'sec-ch-ua-mobile':   req.headers['sec-ch-ua-mobile'],
                },
            }, 'USER AGENT IN BLOCK');
            reply.code(403);
            reply.send({ message: 'Access denied', statusCode: 403 });
        }
        
        if ([
            '38.153.51.11',
        ].includes(req.headers['x-real-ip'])) {
            req.log.error({
                url:     req.raw.url,
                id:      req.id,
                headers: {
                    access:               req.headers.access,
                    profile:              req.headers.profile,
                    fingerprint:          req.headers.fingerprint,
                    host:                 req.headers.host,
                    referer:              req.headers.referer,
                    'user-agent':         req.headers['user-agent'],
                    'x-forwarded-for':    req.headers['x-forwarded-for'],
                    'x-real-ip':          req.headers['x-real-ip'],
                    'sec-ch-ua':          req.headers['sec-ch-ua'],
                    'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'],
                    'sec-ch-ua-mobile':   req.headers['sec-ch-ua-mobile'],
                },
            }, 'USER IP IN BLOCK');
            reply.code(403);
            reply.send({ message: 'Access denied', statusCode: 403 });
        }
    }
    catch (err) {
        console.log('ERROR ON REQUEST HOOK');
        console.log(err.message, err.stack);
    }
    done();
});

fastify.listen(process.env.H_PORT, process.env.H_IP, (err, address) => {
    if (err) throw err;
});
