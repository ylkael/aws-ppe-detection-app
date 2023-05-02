#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PpeAppStack } from '../lib/ppe-app-stack';
import { TranslatorStack } from '../lib/translator-stack';

const app = new cdk.App();

const pharmacyClient = new PpeAppStack(app, 'PharmacyPpeStack', {
  DETECTHEADCOVER: false,
  DETECTFACECOVER: true,
  DETECTHANDCOVER: true
});

const workshopClient = new PpeAppStack(app, 'WorkshopPpeStack', {
  DETECTHEADCOVER: true,
  DETECTFACECOVER: true,
  DETECTHANDCOVER: true
});

new TranslatorStack(app, 'TranslatorStack', {
  snsTopic: [pharmacyClient.snsTopic, workshopClient.snsTopic],
  translateTo: 'fi'
});