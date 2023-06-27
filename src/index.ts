import { Server, ServerOptions, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import type { Server as HTTPSServer } from 'https';
import type { Http2SecureServer } from 'http2';

export type SchemaCollection<SchemaType> = Record<string, SchemaType>;

export type ValidateFunction<
  SchemaType extends unknown,
  DataType extends unknown[] = unknown[],
  ValidationReturnType extends unknown = unknown,
> =
  | ((schema: SchemaType, data: DataType) => Promise<ValidationReturnType>)
  | ((schema: SchemaType, data: DataType) => ValidationReturnType);

export type EventCallback<
  DataType extends unknown[] = unknown[],
  ErrorType = unknown,
> = (error: ErrorType, ...args: DataType) => void | Promise<void>;

export type SocknetParams<
  SchemaType,
  DataType extends unknown[] = unknown[],
> = {
  schemas: SchemaCollection<SchemaType>;
  validate: ValidateFunction<SchemaType, DataType>;
};

export class Socknet<
  SchemaType,
  DataType extends unknown[] = unknown[],
> extends Server {
  schemas: SchemaCollection<SchemaType>;

  validate: ValidateFunction<SchemaType, DataType>;

  constructor(
    { schemas, validate }: SocknetParams<SchemaType, DataType>,
    opts?: Partial<ServerOptions>,
  );

  constructor(
    { schemas, validate }: SocknetParams<SchemaType, DataType>,
    srv?: HttpServer | HTTPSServer | Http2SecureServer | number,
    opts?: Partial<ServerOptions>,
  );

  constructor(
    { schemas, validate }: SocknetParams<SchemaType, DataType>,
    srv:
      | undefined
      | Partial<ServerOptions>
      | HttpServer
      | HTTPSServer
      | Http2SecureServer
      | number,
    opts?: Partial<ServerOptions>,
  ) {
    super(srv, opts);

    this.schemas = schemas;
    this.validate = validate;
  }

  on(name: string, callback: (socket: Socket) => void | Promise<void>) {
    if (name !== 'connection') {
      return super.on(name, callback);
    }

    return super.on(name, (socket: Socket & { isInjected?: boolean }) => {
      if (socket.isInjected) {
        callback(socket);

        return this;
      }

      const injectedSocketProxy = new Proxy(socket, {
        get: (target, key) => {
          if (key === 'isInjectedSocket') return true;
          if (key === 'on') return this.onCallbackFactory(target);

          return target[key as keyof typeof target];
        },
      });

      callback(injectedSocketProxy);

      return this;
    });
  }

  onCallbackFactory(socket: Socket) {
    return (
      name: string,
      onCallback: (...args: DataType) => void | Promise<void>,
    ) => {
      const schema = this.schemas[name];

      return socket.on(name, (async (...args: DataType) => {
        const lastArg = args[args.length - 1];
        const eventCallback =
          args.length > 0 && typeof lastArg === 'function'
            ? (lastArg as EventCallback)
            : undefined;

        try {
          if (schema) {
            await this.validate(schema, args);
          }

          const result = await onCallback(...args);

          if (eventCallback) {
            eventCallback(null, result);
          }
        } catch (error) {
          if (eventCallback) {
            eventCallback(error);
          } else {
            console.warn(error);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as unknown as (...args: any[]) => void);
    };
  }
}
