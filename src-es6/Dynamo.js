import AWS from 'aws-sdk'

/**
 * A DynamoDB Wrapper in order to
 * get very specific things from DynamoDB.
 */
export default class Dynamo {

  /**
   * Initializes the actual AWS.DynamoDB client as well as the table name we're
   * using. The tablename is hardcoded here so we can easily tell users
   * "Just go here, and put your api key in this specific location".
   *
   * Trying to get a user to echo a 32+ random hexadecimal string over an echo
   * does not sound like a good UX experience for a user.
   */
  constructor() {
    this.DYNAMO = new AWS.DynamoDB({
      apiVersion: '2012-08-10',
      region: 'us-east-1'
    })
    this.TABLENAME = 'alexa_pagerDuty'
  }

  /**
   * Get the entire configuration payload from the DynamoDB Table.
   * This like the hardcoded table name also looks at a hardcoded user
   * called 'alexa'. Again the main reason for this is it's probably
   * one of the "easiest" ways to get a user to store a 32 character string.
   *
   * It should be noted by "Entire Configuration Payload" I really mean
   * unparsed DynamoDB response. The full response payload may have been
   * more apt. If you want parsed use `getFullConfiguration()` which is
   * in this class.
   */
  getData() {
    return new Promise((resolve, reject) => {
      this.DYNAMO.getItem({
        Key: {
          user: {
            S: 'alexa'
          }
        },
        TableName: this.TABLENAME,
        AttributesToGet: [
          'config',
        ],
        ConsistentRead: true
      }, (err, data) => {
        if (err) {
          console.log('Error in Dynamo getData()')
          console.log(err)
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /**
   * Grabs the AuthToken (pager duty api key) out of the Dynamo DB table,
   * and returns it. This doesn't handle caching, or anything for you. So
   * you should get it, store it, and keep it safe in sound.
   *
   * Aka don't give it to a user to put on a sticky note hanging off their
   * monitor. This is still an API Key after all.
   */
  getMyAuthToken() {
    return new Promise((resolve, reject) => {
      this.getData().then((resp) => {
        let potentialKey = JSON.parse(resp.Item.config.S).pagerDutyKey
        if (potentialKey == null) {
          console.log("PagerDutyKey not found in Dynamo")
          reject("PagerDutyKey not found in Dynamo")
        } else {
          resolve(potentialKey)
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }

  /**
   * Returns the full configuration object parsed from DynamoDB.
   * We don't even use this anywhere in our methods. The idea was
   * originally to allow users to store any sort of metadata here,
   * but it didn't really pan out UX wise. So we left it here
   * for people who want to hack on the code.
   */
  getFullConfiguration() {
    return new Promise((resolve, reject) => {
      this.getData().then((data) => {
        let potentialData = JSON.parse(data.Item.config.S)
        if (potentialData == null) {
          reject("Failed to grab data from dynamo")
        } else {
          resolve(potentialData)
        }
      }).catch((err) => {
        reject(err)
      })
    })
  }
}
