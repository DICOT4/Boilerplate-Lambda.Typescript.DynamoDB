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
import { uuid } from 'uuidv4';
// Load the AWS SDK for Node.js
import * as AWS from 'aws-sdk';
// Set the region
AWS.config.update({region: 'us-west-1'});

// Create the DynamoDB service object
const _dynamoDB = new AWS.DynamoDB({apiVersion: '2012-08-10'});

interface Response {
    statusCode: number;
    body: string;
}

// PUT: /contracts
const create: Handler = async (event: any, context: Context, callback: Callback) => {
    if (event.body !== null && event.body !== undefined) {

        const {definition, version, key, owner, category, info} = JSON.parse(event.body);
        let params = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: {
                'id': {S: uuid()},
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
            let response = await _dynamoDB.putItem(params).promise();
            const res: Response = {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Success",
                    data: params.Item
                })
            };
            callback(undefined, res);
        } catch (e) {
            const response: Response = {
                statusCode: e.statusCode,
                body: JSON.stringify({
                    message: e.message,
                    data: {}
                })
            };
            callback(undefined, response);
        }
    } else {
        const res: Response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Failed: Invalid body',
                data: {}
            })
        };
        callback(undefined, res);
    }
};

// GET: /contracts
const list: Handler = async (event: any, context: Context, callback: Callback) => {
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE
        };
        // @ts-ignore
        const response = await _dynamoDB.scan(params).promise();
        let data = response.Items ? response.Items : null;
        // if (data) {
        //     data.forEach(element => {
        //         element = cleanseContract(element);
        //     });
        // }
        const res: Response = {
            statusCode: 200,
            body: JSON.stringify({
                message: "Success",
                data: data
            })
        };
        callback(undefined, res);
    } catch (e) {
        const res: Response = {
            statusCode: e.statusCode,
            body: JSON.stringify({
                message: e.message,
                data: {}
            })
        };
        callback(undefined, res);
    }
};

// /contracts/{key}
const listByKey: Handler = async (event: any, context: Context, callback: Callback) => {
    const params = {
        KeyConditionExpression: '_key = :key',
        ExpressionAttributeValues: {
            ':key': {'S': event.pathParameters.key}
        },
        ScanIndexForward: false,
        TableName: process.env.DYNAMODB_TABLE
    };

    try {
        // @ts-ignore
        const response = await _dynamoDB.query(params).promise();
        let data = response.Items ? response.Items : null;
        if (data) {
            data.forEach(element => {
                element = cleanseContract(element);
            });
        }
        const res: Response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success',
                data: data
            })
        };
        callback(undefined, res);
    } catch (e) {
        const res: Response = {
            statusCode: e.statusCode,
            body: JSON.stringify({
                message: e.message,
                data: {}
            })
        };
        callback(undefined, res);
    }
};

// /contracts/key/{key}
const getByKey: Handler = async (event: any, context: Context, callback: Callback) => {
    const params = {
        KeyConditionExpression: '_key = :key',
        ExpressionAttributeValues: {
            ':key': {'S': event.pathParameters.key}
        },
        ScanIndexForward: false,
        TableName: process.env.DYNAMODB_TABLE
    };

    try {
        // @ts-ignore
        const response = await _dynamoDB.query(params).promise();
        // @ts-ignore
        let data = response.Items.length > 0 ? cleanseContract(response.Items[0]) : null
        if (data) {
            // @ts-ignore
            data.forEach(element => {
                element = cleanseContract(element);
            });
        }
        const res: Response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success',
                data: data
            })
        };
        callback(undefined, res);
    } catch (e) {
        const res: Response = {
            statusCode: e.statusCode,
            body: JSON.stringify({
                message: e.message,
                data: {}
            })
        };
        callback(undefined, res);
    }
};

// /contracts/key/{key}/version/{versionId}
const getByKeyAndVersion: Handler = async (event: any, context: Context, callback: Callback) => {
    const params = {
        KeyConditionExpression: 'version = :version and _key = :key',
        ExpressionAttributeValues: {
            ':key': {'S': event.pathParameters.key},
            ':version': {'S': event.pathParameters.versionId}
        },
        TableName: process.env.DYNAMODB_TABLE
    };

    try {
        // @ts-ignore
        const response = await _dynamoDB.query(params).promise();
        // @ts-ignore
        let data = response.Items.length > 0 ? cleanseContract(response.Items[0]) : null
        if (data) {
            // @ts-ignore
            data.forEach(element => {
                element = cleanseContract(element);
            });
        }
        const res: Response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success',
                data: data
            })
        };
        callback(undefined, res);
    } catch (e) {
        const res: Response = {
            statusCode: e.statusCode,
            body: JSON.stringify({
                message: e.message,
                data: {}
            })
        };
        callback(undefined, res);
    }
};

// /contracts/search
const searchInfo: Handler = async (event: any, context: Context, callback: Callback) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE
    };

    try {
        // @ts-ignore
        const response = await _dynamoDB.scan(params).promise();
        let data = response.Items ? response.Items : null;
        if (data) {
            data.forEach(element => {
                element = cleanseContract(element);
            });
            data = data.filter((element, _index, _array) => {
                // @ts-ignore
                return element.info.includes(_event.body.term);
            })
        }
        const res: Response = {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Success',
                data: data
            })
        };
        callback(undefined, res);
    } catch (e) {
        const res: Response = {
            statusCode: e.statusCode,
            body: JSON.stringify({
                message: e.message,
                data: {}
            })
        };
        callback(undefined, res);
    }
};

// Utility
const cleanseContract = (contract: { [x: string]: AWS.DynamoDB.AttributeValue; id?: any; version?: any; definition?: any; _key?: any; category?: any; owner?: any; info?: any; active_at?: any; deprecated_at?: any; }) => {
    if (contract) {
        if (contract.id) contract.id = contract.id.S;
        if (contract.version) contract.version = contract.version.S;
        if (contract.definition) {
            if (isValidJSON(contract.definition)) {
                contract.definition = JSON.parse(contract.definition.S);
            } else {
                contract.definition = contract.definition.S;
            }
        }
        if (contract._key) contract._key = contract._key.S;
        if (contract.category) contract.category = contract.category.SS;
        if (contract.owner) contract.owner = contract.owner.S;
        if (contract.info) contract.info = contract.info.S;
        if (contract.active_at) contract.active_at = contract.active_at.S;
        if (contract.deprecated_at) contract.deprecated_at = contract.deprecated_at.S;
    }
    return contract;
};

const isValidJSON = (str: string) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export { create, list, listByKey, getByKey, getByKeyAndVersion, searchInfo }
