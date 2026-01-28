# Instructions
- There is no NPM packages for k6, thus we have to install k6 in machine

## Step 1 - Install K6 in machine
- Refer official website for windows and mac installation `https://grafana.com/docs/k6/latest/set-up/install-k6/`
- Verify the installation by `k6 version`
- 
### Step 2 - get user tokens
- move to hush-chat/scripts/k6-load-testing
- run scripts by `node getUserTokens.js`
- tokens.json file will be created for users

### Step 3 - run scripts
- move to hush-chat/scripts/k6-load-testing and relavant file path
- run scripts in `BASH` by `export $(cat .env | xargs) && k6 run onePersonSendToOnePerson.js`
- if run without env file, fill base_url and tenant name in script

## NOTE
- each scripts run on different conditions. check each script before run to fill essential fields