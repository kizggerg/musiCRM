import AWS from 'aws-sdk';
import * as uuid from 'uuid';

const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-west-2' });

export const handler = async (event, context) => {
    const body = JSON.parse(event.body);
    const id = uuid.v4();

    if (!body.date || !body.location || !body.amount || !body.distance) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Required field(s) missing or invalid" })
        }
    }

    const expense = {
        TableName: "Expenses",
        Item: {
            id,
            date: body.date,
            location: body.location,
            distance: body.distance,
            amount: body.amount
        }
    };

    try {
        await dynamoDb.put(expense).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Expense saved successfully." })
        };
    } catch (error) {
        console.error("Error saving to DynamoDB:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" })
        };
    }
};