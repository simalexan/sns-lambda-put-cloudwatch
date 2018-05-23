const AWS = require('aws-sdk');
const cloudWatch = new AWS.CloudWatch();
const uuidv4 = require('uuid/v4');
const parseSnsMessage = require('./parse-sns-event');
const CLOUDWATCH_NAMESPACE = process.env.CLOUDWATCH_NAMESPACE;

exports.handler = (event) => {
    let messages = parseSnsMessage(event);
    return Promise.all(messages.map(saveToCloudWatch));
};

saveToCloudWatch = message => {
    const params = {
        MetricData: [convertToMetricData(message)],
        Namespace: CLOUDWATCH_NAMESPACE
    };
    return cloudWatch.putMetricData(params).promise();
};

convertToMetricData = function (message) {
    let props = [], dimensions = [];
    if (typeof message !== 'string') {
        props = Object.keys(message);
        dimensions = props.map(property => toDimension(property, message[property]));
    } else {
        dimensions = [toDimension('Message', message)];
    }
    return {
        MetricName: 'Count',
        Unit: 'Count',
        Value: 1.0,
        Dimensions: dimensions,
        StorageResolution: 1,
        Timestamp: new Date()
    };
};

toDimension = (name, value) => ({Name: name, Value: value || '-'});