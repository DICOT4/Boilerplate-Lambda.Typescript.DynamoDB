// 'use strict';

// module.exports.hello = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Your function executed successfully!',
//         input: event,
//       },
//       null,
//       2
//     ),
//   };

//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };

import { Handler, Context, Callback } from 'aws-lambda';
import {v4 as uuidv4} from 'uuid';
// Load the AWS SDK for Node.js
import * as AWS from 'aws-sdk';
// Set the region
AWS.config.update({region: 'us-east-1'});

// Create the DynamoDB service object
const _dynamoDB = new AWS.DynamoDB({apiVersion: '2012-08-10'});

interface HelloResponse {
    statusCode: number;
    body: string;
}

const create: Handler = async (event: any, context: Context, callback: Callback) => {
    if (event.body !== null && event.body !== undefined) {

        const {definition, version, key, owner, category, info} = JSON.parse(event.body);
        let params = {
            TableName: 'Contracts',
            Item: {
                'id': {S: uuidv4()},
                'version': {S: version},
                'definition': {S: definition},
                '_key': {S: key},
                'category': {SS: category},
                'owner': {S: owner},
                'info': {S: info},
                'active_at': {S: Date.now().toString()},
                'deprecated_at': {S: ''}
            }
        };

        try {
            // @ts-ignore
            let promiseResponse = await _dynamoDB.putItem(params).promise();
            const response: HelloResponse = {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Success",
                    response: promiseResponse,
                    data: params.Item
                })
            };
            callback(undefined, response);
        } catch (e) {
            console.log(e);
            const response: HelloResponse = {
                statusCode: e.statusCode,
                body: JSON.stringify({
                    message: e.message,
                    data: {}
                })
            };
            callback(undefined, response);
        }
    } else {
        const response: HelloResponse = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Failed: Invalid body',
                data: {}
            })
        };
        callback(undefined, response);
    }
};

const list: Handler = async (event: any, context: Context, callback: Callback) => {
    try {
        const params = {
            TableName: 'Contracts'
        };
        const promiseResponse = await _dynamoDB.scan(params).promise();
        let data = promiseResponse.Items ? promiseResponse.Items : null;
        // if (data) {
        //     data.forEach(element => {
        //         element = cleanseContract(element);
        //     });
        // }
        const response: HelloResponse = {
            statusCode: 200,
            body: JSON.stringify({
                message: "Success",
                data: data
            })
        };
        callback(undefined, response);
    } catch (e) {
        console.log(e);
        const response: HelloResponse = {
            statusCode: e.statusCode,
            body: JSON.stringify({
                message: e.message,
                data: {}
            })
        };
        callback(undefined, response);
    }
};

export { create, list }
