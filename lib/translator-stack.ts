import * as cdk from 'aws-cdk-lib';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

// Interface to have array of SNS topics and variable for language to translate to
interface TranslatorStackProps extends cdk.StackProps {
    snsTopic: Array<sns.Topic>;
    translateTo: string;
}
export class TranslatorStack extends cdk.Stack{
    constructor (scope: Construct, id: string, props: TranslatorStackProps){
        super(scope, id, props);

        // DynamoDB table to store translated results
        const translatortable = new dynamodb.Table(this, 'TranslatorResultTable', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: { 
                name: 'id', 
                type: dynamodb.AttributeType.STRING 
            },
        });

        // Iterate through the SNS topic array and add Lambda event source for each
        var count = 0;
            props.snsTopic.forEach(snstopic => {
                count++;
                const translatorFunction = new lambda.Function(this, 'TranslatorFunction' + count, {
                    runtime: lambda.Runtime.NODEJS_14_X,
                    handler: 'translate.handler',
                    code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
                });
                translatorFunction.addEnvironment('TABLE_NAME', translatortable.tableName);
                translatorFunction.addEnvironment('TRANSLATE_TO', props.translateTo);
                translatortable.grantWriteData(translatorFunction);
                translatorFunction.addEventSource(new SnsEventSource(snstopic));
                translatorFunction.addToRolePolicy(new iam.PolicyStatement({
                    actions: ['translate:TranslateText'],
                    resources: ['*']
                }));
            });



    }
}