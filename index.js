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
    const props = Object.keys(message);
    const dimensions = props.map(property => {
        return toDimension(property, message[property]);
    })
    return {
        MetricName: 'Message',
        Unit: 'Message',
        Value: 1.0,
        Dimensions: dimensions,
        StorageResolution: 1,
        Timestamp: new Date()
    };
};

toDimension = (name, value) => ({Name: name, Value: value || '-'});