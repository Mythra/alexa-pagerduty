import Dynamo from './Dynamo'
import request from 'request'

/**
 * A wrapper around the Pagerduty API to provide certain functions, easily.
 */
export default class Pagerduty {

  /**
   * Constructs an instance. Sets the API Host, connects to Dynamo.
   */
  constructor() {
    this.apiHost = 'api.pagerduty.com'
    this.apiToken = null
    this.dynamo = new Dynamo()
  }

  /**
   * A Helper promise that allows us to cache the API Token, incase we need
   * to make multiple calls to pagerduty we don't have to make multiple calls
   * to dynamo. The idea is go as fast as possible. Reduce calls you don't need.
   */
  getApiToken() {
    return new Promise((resolve, reject) => {
      if (this.apiToken) {
        resolve(this.apiToken)
      } else {
        this.dynamo.getMyAuthToken().then((token) => {
          this.apiToken = token
          resolve(token)
        }).catch((err) => {
          console.log('Error getting auth token from dynamo')
          console.log(err)
          reject(err)
        })
      }
    })
  }

  /**
   * A Quick helper function to get a list of headers. We originally thought
   * we'd have like multiple headers but ended up with just these two.
   */
  getHeaders(apiToken) {
    return {
      'Authorization': `Token token=${apiToken}`
    }
  }

  /**
   * A Quick function to get update only headers.
   */
  getUpdateHeaders(apiToken, email) {
    return {
      'Authorization': `Token token=${apiToken}`,
      'Accept': 'application/vnd.pagerduty+json;version=2',
      'From': email
    }
  }

  /**
   * Lists all the alerts from pagerduty.
   */
  listAlerts() {
    return new Promise((resolve, reject) => {
      this.getApiToken().then((apiToken) => {
        request.get({
          method: 'get',
          url: `https://${this.apiHost}/incidents`,
          headers: this.getHeaders(apiToken)
        }, (err, res, body) => {
          if (err) {
            console.log('Error listing pagerduty alerts')
            reject(err)
          } else {
            let trueResponse = JSON.parse(body)
            let alerts = trueResponse.incidents.filter((incident) => {
              return incident.status == 'triggered'
            }).map((incident) => {
              return {
                name: incident.description,
                id: incident.id
              }
            })
            if (alerts.length != 0) {
              resolve(alerts)
            } else {
              console.log("Couldn't map over alerts from pagerduty")
              reject("map failure")
            }
          }
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }

  /**
   * Do something to the latest alert. I don't know why I chose the name set
   * here. I just kind of did. It seemed like a good thing to do at the time,
   * but now I'm writing this documentation trying not to fall asleep. So
   * it's staying where it is.
   *
   * Basically all this does is make a put request to resolve/escalate/ack.
   */
  setLatestAlert(action) {
    return new Promise((resolve, reject) => {
      this.dynamo.getFullConfiguration().then((fullConfiguration) => {
        this.listAlerts().then((alerts) => {
          let alertToTarget = alerts[0]
          let apiToken = fullConfiguration.pagerDutyKey;
          let email = fullConfiguration.email;
          request.put({
            method: 'put',
            url: `https://${this.apiHost}/incidents/`,
            headers: this.getUpdateHeaders(apiToken, email),
            json: true,
            body: {
              incidents: [{
                id: alertToTarget.id,
                type: 'incident_reference',
                status: action
              }]
            }
          }, (err, resp, body) => {
            if (err) {
              console.log('Resolve Ran into an error')
              console.log(err)
              reject(err)
            } else {
              resolve()
            }
          })
        }).catch((err) => {
          reject(err)
        })
      }).catch((err) => {
        reject(err)
      })
    })
  }
}
