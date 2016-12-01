cd build/
unzip Alexa-Pagerduty-development.zip
rm AlexaSkill.js context.json deploy.env .env Dynamo.js event.json index.js package.json Pagerduty.js yarn.lock
mv dist/index.js .
rm -rf dist/
rm Alexa-Pagerduty-development.zip
zip -r Alexa-Pagerduty.zip .
cd ..
