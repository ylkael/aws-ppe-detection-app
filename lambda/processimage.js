const AWS = require("aws-sdk");
const { TABLE_NAME, SNS_TOPIC, HEADCOVER, FACECOVER, HANDCOVER } = process.env;
const rekognition = new AWS.Rekognition();
const docClient = new AWS.DynamoDB.DocumentClient();
const snsClient = new AWS.SNS();

exports.handler = async function (event, context) {
  // Read the bucket name and key from the event
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const typeMatch = srcKey.match(/\.([^.]*)$/);

  // Ensure the type of file is image
  if (!typeMatch) {
    console.log("Could not determine the image type.");
    return;
  }
  const imageType = typeMatch[1].toLowerCase();
  if (imageType != "jpeg" && imageType != "jpg" && imageType != "png") {
    console.log("Unsupported image type:", imageType);
    console.log("Supported image types are: .jpeg, .jpg and .png");
    return;
  }
  
  try {
    // Call rekognition API
    const ppeparams = {
      Image: {
        S3Object: {
          Bucket: srcBucket,
          Name: srcKey,
        },
      },
    };
    const rekognitionresponse = await rekognition
      .detectProtectiveEquipment(ppeparams)
      .promise();
    console.log('Rekognition response: ',JSON.stringify(rekognitionresponse));
    
    // Insert the data in dynamodb table for further processing
    const dynamodbparam = {
      TableName: TABLE_NAME,
      Item: {
        id: context.awsRequestId,
        objectkey: srcKey,
        bucketname: srcBucket,
        rekonitionResponse: rekognitionresponse.Persons,
      },
    };

    const dynamodbresponse = await docClient.put(dynamodbparam).promise();
    console.log('Dynamodb response: ',JSON.stringify(rekognitionresponse));

    var message = [];
    var personcount = 0;

    // Based on the logic, determine if the notification needs to be send
    if (rekognitionresponse.Persons.length < 1) {
      console.log("No person in the image");
      message.push("No person in the image");
    } 
    else {
      // Check for the body part (head, face, left_hand, right_hand)
      // If any of the body part is detected, check if there is a protective equipment detected with confidence
      // If the requirement is to have PPE for the bodypart and there is no PPE detected for that body part, send notification
      rekognitionresponse.Persons.forEach((person) => {
        personcount++;      
        // Check for the head part
        if (HEADCOVER == "true") {
          var head = person.BodyParts.find(
            (bodypart) => bodypart.Name == "HEAD"
          );
          console.log("head ", head);
          // No head is detected. Should be notified
          if (head == null) {
            console.log(
              "Image does not contain head for person " + personcount
            );
            message.push(
              "Image does not contain head for person " + personcount
            );
          } 
          // No head equipment is detected. Should be notified
          else if (head.EquipmentDetections.length <= 0) {
            console.log(
              "Image does not contain head cover for person " + personcount
            );
            message.push(
              "Image does not contain head cover for person " + personcount
            );
          }
        }

        // Check for the face part
        if (FACECOVER == "true") {
          var face = person.BodyParts.find(
            (bodypart) => bodypart.Name == "FACE"
          );
          console.log("Face ", face);
          // No face is detected. Should be notified
          if (face == null) {
            console.log(
              "Image does not contain face for person " + personcount
            );
            message.push(
              "Image does not contain face for person " + personcount
            );
          } 
          // No face equipment is detected. Should be notified
          else if (face.EquipmentDetections.length <= 0) {
            console.log(
              "Image does not contain face cover for person " + personcount
            );
            message.push(
              "Image does not contain face cover for person" + personcount
            );
          }
        }

        // Check for the hand part
        if (HANDCOVER == "true") {
          var hand = person.BodyParts.find(
            (bodypart) =>
              bodypart.Name == "LEFT_HAND" || bodypart.Name == "RIGHT_HAND"
          );
          console.log("hand ", hand);
          // No hand is detected. Should be notified
          if (hand == null) {
            console.log(
              "Image does not contain hand for person " + personcount
            );
            message.push(
              "Image does not contain hand for person " + personcount
            );
          } 
          // No hand equipment is detected. Should be notified
          else if (hand.EquipmentDetections.length <= 0) {
            console.log(
              "Image does not contain hand cover for person " + personcount
            );
            message.push(
              "Image does not contain hand cover for person " + personcount
            );
          }
        }
      });

      // If there are any messages, send notification
      console.log("Message: ", JSON.stringify(message));
      if (message.length > 0) {
        var params = {
          Message: JSON.stringify(message) + " in " + srcBucket + "/" + srcKey,
          TopicArn: SNS_TOPIC,
        };
        await snsClient.publish(params).promise();
      }
    }
  } 
  catch (error) {
    console.log(error);
    return;
  }

  // If no errors, return success message
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body:
      "Successfully processed the image. " +
      "Image location is  : " +
      srcBucket +
      " / " +
      srcKey,
  };
};