# PPE Detection App

This app detects Personal Protective Equipment (PPE) in the images added in s3 bucket using Amazon Rekognition. SNS email notification will be send if PPE is not detected. Application will have logic to determine what kind of PPE needs to be detected. This includes head cover, facemask and hand cover.  

App uses 2 stacks with detection rules:  

1. "Pharmacy"  
Represents a medical pharmacy  
Detects if workers are wearing 2 equipments:
    * Face cover
    * Hand cover

2. "Workshop"  
Represents a physical workshop or a garage  
Detects if workers are wearing 3 equipments:  
    * Head cover  
    * Face cover  
    * Hand cover  

&nbsp;

---

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

## Usage  

After deploying the stacks, confirm the SNS subscriptions for Pharmacy and Workshop Topics.  

Pharmacystack sends alerts via email if the face-cover and/or hand-cover is not detected in the photo.  
Workshopstack sends alerts if head cover, face cover and/or hand cover is not detected in the photo.  

Upload an image to either Pharmacystack S3-bucket or Workshopstack S3-bucket to check if the person is wearing proper equipment.  

If you upload an image with head cover, face cover and hand cover you would not get any notification in any stack.  
