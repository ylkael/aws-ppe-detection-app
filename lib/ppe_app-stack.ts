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
      displayName: 'PPE Detection Failure',
      topicName: 'PPE-Failure-Topic'
    });

    // Parameter to specify email address to receive PPE failure notifications
    const email = new cdk.CfnParameter(this, 'email', {
      type: 'String',
      description: 'Email address to receive PPE failure notifications'
    });

    // Subscribe to SNS topic to receive PPE failure notifications via email
    snsTopic.addSubscription(new subs.EmailSubscription(email.valueAsString));

  }
}
