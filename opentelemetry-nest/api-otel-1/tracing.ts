import {
    ConsoleSpanExporter,
    SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import * as process from 'process';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const jaegerExporter = new JaegerExporter({
    endpoint: 'http://jaeger:14268/api/traces',
})

const traceExporter = jaegerExporter;

export const otelSDK = new NodeSDK({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: `nestjs-otel`,
      }),
    spanProcessor: new SimpleSpanProcessor(traceExporter),
    instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new NestInstrumentation()
    ],
});

process.on('SIGTERM', () => {
        otelSDK
        .shutdown()
        .then(
            () => console.log('SDK desligada, sucesso'),
            (err) => console.log('Erro no Jaeger', err),
        )
        .finally(() => process.exit(0));
    }
);