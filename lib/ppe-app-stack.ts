import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';

// Interface to pass parameters to stack
interface PpeAppStackProps extends cdk.StackProps {
  DETECTHEADCOVER: boolean;
  DETECTFACECOVER: boolean;
  DETECTHANDCOVER: boolean;
}

export class PpeAppStack extends cdk.Stack {
  public readonly snsTopic: sns.Topic;
  constructor(scope: Construct, id: string, props: PpeAppStackProps) {
    super(scope, id, props);
  
    // S3 bucket for storing image input
    const inputbucket = new s3.Bucket(this, 'ImageInputBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
    });

    // DynamoDB table for storing image processing result
    const dynamodbtable = new dynamodb.Table(this, 'ImageResultTable', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: { 
        name: 'id', 
        type: dynamodb.AttributeType.STRING 
      },
    });
    
    // SNS topic to notify PPE detection failure via email
    this.snsTopic = new sns.Topic(this, 'SNSNotification', {
      displayName: 'PPE Detection Failure',
      topicName: this.stackName + '-PPE-Failure-Topic'
    });
    
    // Parameter to specify email address for subscription notifications
    const email = new cdk.CfnParameter(this, 'email', {
      type: 'String',
      description: 'Email address to receive PPE failure notifications'
    });
    this.snsTopic.addSubscription(new subs.EmailSubscription(email.valueAsString));

    // Lambda function to detect PPE
    const processImage = new lambda.Function(this, 'ProcessImageFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'processimage.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
    });

    // Environment variables for Lambda function
    processImage.addEnvironment('TABLE_NAME', dynamodbtable.tableName);
    processImage.addEnvironment('SNS_TOPIC', this.snsTopic.topicArn);
    processImage.addEnvironment('HEADCOVER', props.DETECTHEADCOVER.toString());
    processImage.addEnvironment('FACECOVER', props.DETECTFACECOVER.toString());
    processImage.addEnvironment('HANDCOVER', props.DETECTHANDCOVER.toString());
    
    // Event subscription for S3 bucket
    inputbucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(processImage));
    
    // IAM policies for Lambda function
    inputbucket.grantRead(processImage); // read access to S3 bucket
    dynamodbtable.grantWriteData(processImage); // write access to DynamoDB table
    this.snsTopic.grantPublish(processImage); // publish access to SNS topic
    processImage.role?.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonRekognitionReadOnlyAccess')); // Rekognition read access IAM role

  }
}
