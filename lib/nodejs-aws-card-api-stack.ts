import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class NodejsAwsCardApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda function
    const nestLambda = new nodejs.NodejsFunction(this, 'NestjsLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../lambda/serverless/index.ts'),
      handler: 'index.handler',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      bundling: {
        minify: true,
        sourceMap: false,
        nodeModules: [
          '@nestjs/core',
          '@nestjs/common',
          '@nestjs/platform-express',
          'reflect-metadata',
          '@vendia/serverless-express',
        ],
        externalModules: [
          'aws-sdk', // Don't bundle aws-sdk as it's available in the Lambda runtime
        ],
      },
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'NestjsApi', {
      restApiName: 'Nest.js API Service',
      description: 'API Gateway for Nest.js Lambda',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Integrate API Gateway with Lambda
    const integration = new apigateway.LambdaIntegration(nestLambda, {
      proxy: true,
    });

    // Add proxy resource to handle all routes
    api.root.addProxy({
      defaultIntegration: integration,
      anyMethod: true,
    });
  }
}
