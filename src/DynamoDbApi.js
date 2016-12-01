var AWS = require('aws-sdk')
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10', region: 'us-east-1'})
var tableName = 'alexa_pagerDuty'

function getMyAuthToken(cb) {
  getData(function(err, data){
    if(err){
      console.log(err)
    }
    var config = JSON.parse(data.Item.config.S).pagerDutyKey
    return cb(config)
  })
}

function getMyServices() {

}

function getMe(cb){
  getData(function(err, data){
    if(err){
      console.log(err)
    }
    var config = JSON.parse(data.Item.config.S)
    return cb(config)
  })

}

function getData(cb){
  var params = {
    Key: {
      user: {
        S: 'alexa'
      }
    },
    TableName: tableName,
    AttributesToGet: [
      'config',
    ],
    ConsistentRead: true,
  }
  dynamodb.getItem(params, cb);
}

module.exports.getMyAuthToken = getMyAuthToken
module.exports.getMyServices = getMyServices
module.exports.getMe = getMe
