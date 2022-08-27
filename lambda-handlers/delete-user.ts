import { AppSyncResolverHandler, Handler } from 'aws-lambda';
import * as utils from '/opt/utils';
import { User, DeleteUserParams } from '/opt/types'
import { DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { eventNames } from 'process';
export const handler: AppSyncResolverHandler<DeleteUserParams, string> = async (event, context) => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      // Print Event
      const ddbDocClient = await utils.getDDBDocClient();

      const getUserOutput = await ddbDocClient.send(
        new QueryCommand({
          TableName: process.env.DDB_TABLE,
          KeyConditionExpression: `email = :email`,
          ExpressionAttributeValues: {
            ':email': event.arguments.deleteUserInput.email
          },
          ProjectionExpression: 'email'
        })
      );

      if (getUserOutput.Items && getUserOutput.Items.length > 0) {
        await ddbDocClient.send(
          new DeleteCommand({
            TableName: process.env.DDB_TABLE,
            Key: { email: eventNames.arguments.deleteUserInput.email }
          })
        );
        return resolve('User deleted Successfully');
      }else{
        return resolve('User not found');
      }
      utils.logInfo(event, 'Event');
    } catch (error: any) {
      utils.logError(error);
      reject();
    }
  });
};