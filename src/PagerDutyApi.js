var dyno = require('./DynamoDbApi')
var request = require('request')
var api_url = "api.pagerduty.com"

function listAlerts(cb) {
  dyno.getMyAuthToken(function (authToken) {
    var options = {
      method: 'get',
      url: 'https://' + api_url + '/incidents',
      headers: {
        "Authorization": "Token token=" + authToken,
        "Accept": "application/vnd.pagerduty+json;version=2",
      }
    }
    request.get(options, function (err, res, body) {
      if (err) console.log(err)
      var json = JSON.parse(body)
      var alerts = json.incidents.map(function (x) {
        if (x.status === 'triggered') {
          var obj = {}
          obj['name'] = x.description
          obj['id'] = x.id
          return obj
        }
      })
      if (alerts) {
        cb(alerts[alerts.length - 1])
      } else {
        cb()
      }
    })
  })
}

function ackAlert(status, cb) {
  dyno.getMe(function (config) {
    var user = config.email
    var authToken = config.pagerDutyKey
    //first go get the alert
    listAlerts(function (data) {
      if (data) {
        var putData = {
          "incidents": [
            {
              "id": data.id,
              "type": "incident_reference",
              "status": status
            }
          ]
        }

        var options = {
          method: 'put',
          body: putData, // Javascript object
          json: true, // Use,If you are sending JSON data
          url: 'https://' + api_url + '/incidents',
          headers: {
            "Authorization": "Token token=" + authToken,
            "Accept": "application/vnd.pagerduty+json;version=2",
            "From": user,
          }
        }

        request(options, function (err, res, body) {
          if (err) {
            console.log('Error :', err)
            return cb(err)
          }
          cb(body)
        })
      }
    })
  })
}

module.exports = listAlerts
module.exports.list = listAlerts
module.exports.ack = ackAlert

// listAlerts(function (body) {
//   //console.log(body)
})

// ackAlert('acknowledged', function (data) {
//   console.log(data[0].service)
// })
//
// ackAlert('resolved', function (data) {
//   console.log(data[0].service)
// })
