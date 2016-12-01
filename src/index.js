var APP_ID = undefined;

var AlexaSkill = require('./AlexaSkill');

var PagerdutySkill = function () {
  AlexaSkill.call(this, APP_ID);
};

PagerdutySkill.prototype = Object.create(AlexaSkill.prototype);
PagerdutySkill.prototype.constructor = PagerdutySkill;

PagerdutySkill.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

PagerdutySkill.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
  console.log("PagerDutySkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

  handleLastIssueIntent(session, response);
};

PagerdutySkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

PagerdutySkill.prototype.intentHandlers = {
  "LastIssueIntent": function(intent, session, response) {
    handleLastIssueIntent(session, response);
  },

  "AckIssueIntent": function(intent, session, response) {
    handleAckIssueIntent(session, response);
  },

  "ResIssueIntent": function(intent, session, response) {
    handleResIssueIntent(session response);
  },

  "EscIssueIntent": function(intent, session, response) {
    handleEscIssueIntent(session, response);
  },

  "AMAZON.HelpIntent": function(intent, session, response) {
    var speechText = "Pagerduty Incidents come in when pieces of infrastructure go down. Use \"what was that issue\" to get the latest issue.";
    var repromptText = "If you want to actually interact with issues feel free to use \"resolve that issue\".";

    var speechOutput = {
      speech: speechText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    var repromptOutput = {
      speech: repromptText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };

    response.ask(speechOutput, repromptOutput);
  },

  "AMAZON.StopIntent": function(intent, session, response) {
    response.tell("Goodbye Dave");
  },

  "AMAZON.CancelIntent": function(intent, session, response) {
    response.tell("I'm sorry Dave, I can't let you do that.");
  }
};

function handleLastIssueIntent(session, response) {

}

function handleAckIssueIntent(session, response) {

}

function handleResIssueIntent(session, response) {

}

function handleEscIssueIntent(session, response) {

}
