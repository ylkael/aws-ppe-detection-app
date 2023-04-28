# PPE Detection App

This app detects Personal Protective Equipment (PPE) in the images added in s3 bucket using Amazon Rekognition. SNS email notification will be send if PPE is not detected. Application will have logic to determine what kind of PPE needs to be detected. This includes head cover, face cover and hand cover.  

App uses 2 stacks with different detection rules:  

1. "Pharmacy"  
Represents a medical pharmacy.  
Detects if workers are wearing 2 equipments:
    * Face cover
    * Hand cover

2. "Workshop"  
Represents a physical workshop or a garage.  
Detects if workers are wearing 3 equipments:  
    * Head cover  
    * Face cover  
    * Hand cover  

&nbsp;

## Content  

* `lib/ppe-app-stack.ts`  
Defines properties for Stacks:  
Create S3 bucket, DynamoDB table, SNS topic with subscription, Lambda function with env variables, permissions and event notification for S3 bucket.  
Note: the email for SNS is applied via parameter.

* `lambda/processimage.js`  
Defines the logic for PPE detection:  
The Lambda code will be invoked when a file is written to s3 bucket. This code will call AWS Rekognition API and store the result in AWS Dynamodb table. After that, based on the Lambda environment variables, decide to send notification via SNS.  

* `bin/ppe_app.ts`  
Defines Stacks for Pharmacy and Workshop  

---

## Usage  

After deploying the stacks, confirm the subscription emails for Pharmacy and Workshop Topics.  

**Pharmacy-Stack** sends alerts via email if the **face** and/or **hand** cover is **not** detected in the photo.  

**Workshop-Stack** sends alerts if **head**, **face** and/or **hand** cover is **not** detected in the photo.  

Upload an image to either Pharmacy-Stack S3-bucket or Workshop-Stack S3-bucket to check if the person is wearing needed equipment.  

If you upload an image with head cover, face cover **and** hand cover you would not get any notification in any stack.  

---

## Costs  

You will incur the standard costs for each of the AWS services which are utilized. The services include:  

* AWS Lambda Pricing : <https://aws.amazon.com/lambda/pricing/>  
* Amazon Rekognition : <https://aws.amazon.com/rekognition/pricing/>  
* Amazon Dynamodb : <https://aws.amazon.com/dynamodb/pricing/>  
* Amazon SNS : <https://aws.amazon.com/sns/pricing>  
* Amazon Translate : <https://aws.amazon.com/translate/pricing/>  
* Amazon S3 : <https://aws.amazon.com/s3/pricing/>  

---

More info and step-by-step guide: [AWS Workshop Studio](https://catalog.us-east-1.prod.workshops.aws/workshops/caa8dcf9-4867-438a-a737-c2eb409f31c9/en-US )  
