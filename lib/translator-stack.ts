import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

interface TranslatorStackProps extends cdk.StackProps {
    snsTopic: Array<sns.Topic>;
    translateTo: string;
}
export class TranslatorStack extends cdk.Stack{
    constructor (scope: Construct, id: string, props?: TranslatorStackProps){
        super(scope, id, props);

    }
}