import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';

export class PpeAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
    // S3 bucket for storing image input
    const inputbucket = new s3.Bucket(this, 'ImageInputBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });

    // DynamoDB table for storing image processing result
    const dynamodbtable = new dynamodb.Table(this, 'ResultTable', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: { 
        name: 'id', 
        type: dynamodb.AttributeType.STRING 
      },
    });

    // SNS topic to notify PPE detection failure via email
    const snsTopic = new sns.Topic(this, 'SNSNotification', {
      displayName: 'PPE Failure Topic',
      topicName: 'PPE-Failure-Topic'
    });
    snsTopic.addSubscription(new subs.EmailSubscription('YOUR_EMAIL_ADDRESS'));

  }
}
