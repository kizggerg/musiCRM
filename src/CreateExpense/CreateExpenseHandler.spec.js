import AWSMock from 'aws-sdk-mock';
import { jest } from '@jest/globals';

jest.setTimeout(10_000);

describe('CreateExpense', () => {
    async function setupMocks() {
        const mockPut = jest.fn((_, result) => result);
        AWSMock.mock('DynamoDB.DocumentClient', 'put', mockPut);

        const handler = (await import('./CreateExpenseHandler')).handler;

        return {
            handler,
            mockPut
        };
    }

    it('saves the expense to DynamoDB', async () => {
        const { handler, mockPut } = await setupMocks();

        const eventData = {
            body: JSON.stringify({
                date: '2023-08-25',
                location: 'Toronto',
                distance: 120,
                amount: 50
            })
        };

        const response = await handler(eventData);
        
        expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
            TableName: "Expenses",
            Item: {
                id: expect.any(String),
                date: '2023-08-25',
                location: 'Toronto',
                distance: 120,
                amount: 50
            }
        }), expect.anything());

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(JSON.stringify({ message: "Expense saved successfully." }));
    });

    it('should return a 400 error if required fields are missing', async () => {
        const { handler } = await setupMocks();

        const mockEventWithMissingFields = {
            body: JSON.stringify({
                date: "2023-08-24",
                location: "Toronto",
                amount: 45.00
                // "distance" field is intentionally left out
            })
        };
        
        const response = await handler(mockEventWithMissingFields);
    
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(JSON.stringify({ message: "Required field(s) missing or invalid" }));
    });
});