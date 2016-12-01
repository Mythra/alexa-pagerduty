# Alexa Pagerduty #

This is an app for AWS Lambda to bring complete pagerduty control to Amazon's Alexa.
This current app is built + tested in node v6, and transpiled down to node v4.3 in
order to run on Amazon Lambda.

## Building ##

In order to build simply make sure the following things happen:
1. You're running node 4.3.2.
2. Run `npm install`. (or `yarn` for you FB hipsters).
3. Run `npm start` to start a dev environment. (building constantly)
4. Run `npm run pretest && npm run test-run` in order to test run the lambda locally.
5. run `npm run prepackage && npm run package` to generate a zip inside of `build/`.
