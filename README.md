# timing-reconciliation-api

Service to receive timestamps from a start and finish timing gates and match them to cars that have been staged.

Drivers are expected to follow the states below:

POST /stage
POST /start (if multiple drivers are staged this time will be awarded to the first that was staged)
POST /finish (if multiple drivers have started this time will be awarded to the first that was staged)
POST /confirm 
