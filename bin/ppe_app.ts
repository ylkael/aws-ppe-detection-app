#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PpeAppStack } from '../lib/ppe-app-stack';

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