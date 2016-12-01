import AlexaSkill from './AlexaSkill'
import Pagerduty from './Pagerduty'

// This is where you'll replace your APP ID when you upload it to the alexa skills.
//const APPID = "amzn1.ask.skill.[unique-value-here]"
const APPID = "amzn1.ask.skill.feb13d30-cc02-4cec-a010-47a4652b452f"

/**
 * Handles the entire "AlexaSkill", and provides what alexa actually calls.
 */
class PagerdutySkill extends AlexaSkill {

  /**
   * Constructs the actual Pagerduty service. Sets up the eventHandlers/intentHandlers/hooks to Pagerduty class.
   */
  constructor() {
    super(APPID)

    this.eventHandlers = {
      onSessionStarted: (sessionStartedRequest, session) => {
        console.log(`onSessionStarted requestId: ${sessionStartedRequest.requestId}, sessionId: ${session.sessionId}`)
      },
      onLaunch: (launchRequest, session, response) => {
        console.log(`PagerDutySkill onLaunch requestId: ${launchRequest.requestId}, sessionId: ${session.sessionId}`)
        this.handleLastIssueIntent(session, response)
      },
      onIntent: (intentRequest, session, response) => {
        var intent = intentRequest.intent,
            intentName = intentRequest.intent.name,
            intentHandler = this.intentHandlers[intentName];
        if (intentHandler) {
            console.log('dispatch intent = ' + intentName);
            intentHandler.call(this, intent, session, response);
        } else {
            throw 'Unsupported intent = ' + intentName;
        }
      },
      onSessionEnded: (sessionEndedRequest, session) => {
        console.log(`onSessionEnded requestId: ${sessionEndedRequest.requestId}, sessionId: ${session.sessionId}`)
      }
    }

    /**
     * These intent handlers really just route to functions here in the class.
     * usually titled `handle${TypeOfIntent}`. I don't like sticking a bunch of,
     * code here. It just seems messy. Seperating them out into their own function
     * makes my heart sit right at night.
     */
    this.intentHandlers = {
      LastIssueIntent: (intent, session, response) => {
        this.handleLastIssueIntent(session, response)
      },
      AckIssueIntent: (intent, session, response) => {
        this.handleAckIssueIntent(session, response)
      },
      ResIssueIntent: (intent, session, response) => {
        this.handleResIssueIntent(session, response)
      },
      EscIssueIntent: (intent, session, response) => {
        this.handleEscIssueIntent(session, response)
      },
      "AMAZON.HelpIntent": (intent, session, response) => {
        // I feel like both of these are kind of long for a help intent, but I couldn't think of a good sentence that
        // could make as much sense to everyone.
        const speechOutput = {
          speech: 'Pagerduty Incidents come in when pieces of infrastructure go down. Use what was that issue to get the latest issue.',
          type: AlexaSkill.speechOutputType.PLAIN_TEXT
        }
        const repromptOutput = {
          speech: 'If you want to actually interact with issues feel free to use resolve that issue, acknowledge that issue, or escalate that issue.',
          type: AlexaSkill.speechOutputType.PLAIN_TEXT
        }

        response.ask(speechOutput, repromptOutput)
      },
      "AMAZON.StopIntent": (intent, session, response) => {
        response.tell("Goodbye Dave")
      },
      "AMAZON.CancelIntent": (intent, session, response) => {
        // I thought this would be a cutesy sassy remark. But this might actually scare some grandpas named dave.
        response.tell("I'm sorry Dave, I can't let you do that.")
      }
    }

    this.pagerduty = new Pagerduty()
  }


  /**
   * Handles the lastIssueIntent. Grabs the latest issue, and gives you it's description.
   */
  handleLastIssueIntent(session, response) {
    this.pagerduty.listAlerts().then((alerts) => {
      let alert = alerts[0]
      response.tell(`The last issue was: ${alert.name}`)
    }).catch((err) => {
      console.log("Couldn't look up the pager duty api")
      response.tell("I'm sorry I couldn't look up the pagerduty api.")
    })
  }

  /**
   * Handles the acknowledge issue intent. Grabs the latest issue, and acks it.
   */
  handleAckIssueIntent(session, response) {
    this.pagerduty.setLatestAlert('acknowledged').then(() => {
      response.tell("Issue has been acknowledged")
    }).catch((err) => {
      console.log("Couldn't handle ack issue")
      response.tell("I'm sorry I couldn't acknowledge that through pagerduty")
    })
  }

  /**
   * Handles the resolve issue intent. Grabs the latest issue, and resolves it.
   */
  handleResIssueIntent(session, response) {
    this.pagerduty.setLatestAlert('resolved').then(() => {
      response.tell("Issue has been resolved")
    }).catch((err) => {
      console.log("Couldn't handle res issue")
      console.log(err)
      response.tell("I'm sorry I couldn't resolve that through pagerduty")
    })
  }

  /**
   * Handles the escalate issue intent. Grabs the latest issue, and escalates it.
   */
  handleEscIssueIntent(session, response) {
    this.pagerduty.setLatestAlert('reassign').then(() => {
      response.tell("Issue has been escalated")
    }).catch((err) => {
      console.log("Couldn't handle esc issue")
      response.tell("I'm sorry I couldn't escalate that through pagerduty")
    })
  }
}



/**
 * What initially gets called by lambda. Create a pagerduty skill, and execute it.
 */
export default (event, context, callback) => {
   new PagerdutySkill().execute(event, context)
}

/**
 * What initially gets called by lambda. Create a pagerduty skill, and execute it.
 */
module.exports.handler = function (event, context) {
    new PagerdutySkill().execute(event, context);
};
