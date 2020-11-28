# timing-reconciliation-api

Service to receive timestamps from a start and finish timing gates and match them to cars that have been staged.

Drivers are expected to follow the states below:

1. POST /stage
2. POST /start (if multiple drivers are staged this time will be awarded to the first that was staged)
3. POST /finish (if multiple drivers have started this time will be awarded to the first that was staged)
4. POST /confirm 
