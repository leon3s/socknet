import { Namespace, Server, ServerOptions, Socket } from 'socket.io';
import { type Session } from 'socket.io-adapter';
import { Server as HttpServer } from "http";
import type { Server as HTTPSServer } from "https";
import type { Http2SecureServer } from "http2";
import { DefaultEventsMap, EventsMap, ReservedOrUserListener } from 'socket.io/dist/typed-events';
import { Client } from 'socket.io/dist/client';

export interface ValidationError extends Error {
    code?: number,
    statusCode?: number,
    errors?: any[],
}

export type ValidateFunction<
    SchemaType extends unknown,
    DataType extends unknown[] = unknown[],
    ValidationReturnType extends unknown = unknown
> =
    ((schema: SchemaType, data: DataType) => Promise<ValidationReturnType>)
    | ((schema: SchemaType, data: DataType) => ValidationReturnType)


export type SchemaCollection<SchemaType> = Record<string, SchemaType>

export type SocketCallback<SchemaType, DataType extends unknown[] = unknown[]> = (socket: InjectedSocket<SchemaType, DataType>) => void;

export type EventCallback<DataType extends unknown[] = unknown[], ErrorType = unknown> = (error: ErrorType, ...args: DataType) => void | Promise<void>

export class InjectedSocket<SchemaType, DataType extends unknown[] = unknown[]> {
    constructor(
        public schemas: SchemaCollection<SchemaType>,
        public validate: ValidateFunction<SchemaType, DataType>,
        public socket: Socket
    ) {
    }

    on(name: any, onCallback: (...args: any[]) => void | Promise<void>) {
        const schema = this.schemas[name]

        return this.socket.on(name, (async (...args: DataType) => {
            const lastArg = args[args.length - 1];
            let eventCallback = args.length && typeof lastArg === 'function' ? lastArg as EventCallback : undefined;

            try {
                if (schema) {
                    await this.validate(schema, args);
                }

                const result = await onCallback(...args)

                if (eventCallback) {
                    eventCallback(null, result);
                }
            } catch (e) {
                console.warn(e);

                if (eventCallback) {
                    eventCallback(e)
                }
            }
        }))
    }
}


export type SocknetParams<SchemaType, DataType extends unknown[] = unknown[]> = {
    schemas: SchemaCollection<SchemaType>
    validate: ValidateFunction<SchemaType, DataType>,
}

export class Socknet<SchemaType, DataType extends unknown[] = unknown[]> extends Server {
    schemas: SchemaCollection<SchemaType>;
    validate: ValidateFunction<SchemaType, DataType>

    constructor({ schemas, validate }: SocknetParams<SchemaType, DataType>, opts?: Partial<ServerOptions>);
    constructor({ schemas, validate }: SocknetParams<SchemaType, DataType>, srv?: HttpServer | HTTPSServer | Http2SecureServer | number, opts?: Partial<ServerOptions>);
    constructor({ schemas, validate }: SocknetParams<SchemaType, DataType>, srv: undefined | Partial<ServerOptions> | HttpServer | HTTPSServer | Http2SecureServer | number, opts?: Partial<ServerOptions>) {
        super(...[srv, opts]);

        this.schemas = schemas;
        this.validate = validate;
    }

    on(name: string, callback: SocketCallback<SchemaType, DataType>) {
        if (name !== 'connection') {
            super.on(name, callback);
        }

        return super.on(name, (socket: Socket) => {
            if ((socket as any).wtf) {
                return callback(socket as unknown as InjectedSocket<SchemaType, DataType>)
            }

            callback(new InjectedSocket(this.schemas, this.validate, socket))
        });
    }
}
