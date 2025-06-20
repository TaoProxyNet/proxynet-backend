import catchAsync from "@/Utils/helper/catchAsync";
import { NextFunction, Request, Response } from "express";
import { URL } from 'url';

const debuggerMiddleware = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.socket.remoteAddress || 'Unknown';
    const xRealIp = req.get('X-Real-IP') || 'Unknown';
    const ips = req.ips || 'Unknown';
    const xForwardedFor = req.get('X-Forwarded-For') || 'Unknown';
    const xForwardedHost = req.get('X-Forwarded-Host') || 'Unknown';
    const xForwardedProto = req.get('X-Forwarded-Proto') || 'Unknown';
    const referer = req.get('Referer') || 'Unknown';
    const origin = req.get('Origin') || 'Unknown';
    const userAgent = req.get('User-Agent') || 'Unknown';
    const host = req.get('Host') || 'Unknown';
    const connection = req.connection.remoteAddress || 'Unknown';
    const socket = req.socket.remoteAddress || 'Unknown';
    const cp = req.get('cf-connecting-ip') || 'Unknown';

    // Extract domain from Origin or Referer
    let callingDomain = 'Unknown';
    try {
        if (origin !== 'Unknown') {
            callingDomain = new URL(origin).hostname;
        } else if (referer !== 'Unknown') {
            callingDomain = new URL(referer).hostname;
        }
    } catch (error) {
        console.error('Error parsing origin or referer:', error);
    }

    console.log(`
        Request IP: ${clientIp}
        Path: ${req.path}
        Method: ${req.method}
        Referer: ${referer}
        X-Forwarded-For: ${xForwardedFor}
        X-Forwarded-Host: ${xForwardedHost}
        X-Forwarded-Proto: ${xForwardedProto}
        Origin: ${origin}
        Calling Domain: ${callingDomain}
        User-Agent: ${userAgent}
        Host: ${host}
        X-Real-IP: ${xRealIp}
        IPs: ${ips}
        Connection: ${connection}
        Socket: ${socket}
        cf-connecting-ip: ${cp}
        x-forwarded-port: ${req.get('X-Forwarded-Port')}
        x-forwarded-server: ${req.get('X-Forwarded-Server')}
        x-forwarded-prefix: ${req.get('X-Forwarded-Prefix')}
        x-forwarded-uri: ${req.get('X-Forwarded-URI')}
        x-forwarded-ssl: ${req.get('X-Forwarded-SSL')}
        x-forwarded-proto-version: ${req.get('X-Forwarded-Proto-Version')}
        x-forwarded-port-version: ${req.get('X-Forwarded-Port-Version')}
        x-forwarded-host-version: ${req.get('X-Forwarded-Host-Version')}
        x-forwarded-prefix-version: ${req.get('X-Forwarded-Prefix-Version')}
        x-forwarded-uri-version: ${req.get('X-Forwarded-URI-Version')}
        x-forwarded-ssl-version: ${req.get('X-Forwarded-SSL-Version')}
        rawHeaders: ${req.rawHeaders}
    `);
    // sendResponse.success(res, {
    //     message: 'debug',
    //     statusCode: 200,
    //     data: {
    //         headers: req.headers,
    //         header: req.header,
    //         ip: req.ip,
    //         // socket: req.socket,
    //         method: req.method,
    //         rawHeaders: req.rawHeaders,
    //         url: req.url,
    //         path: req.path,
    //         hostname: req.hostname,
    //         protocol: req.protocol,
    //         secure: req.secure,
    //         ips: req.ips,
    //         subdomains: req.subdomains,
    //         originalUrl: req.originalUrl,
    //     },
    // })
    next();
});

export default debuggerMiddleware;