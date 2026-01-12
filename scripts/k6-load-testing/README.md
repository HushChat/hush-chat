# Instructions
- There is no NPM packages for k6, thus we have to install k6 in machine

## Step 1 - Install K6 in machine
- Refer official website for windows and mac installation `https://grafana.com/docs/k6/latest/set-up/install-k6/`
- Verify the installation by `k6 version`
- 
### Step 2 - get user tokens
- move to hush-chat/scripts/k6-load-testing
- run scripts by `k6 run getUserTokens.js`
- tokens.json file will be created for users

### Step 3 - run scripts
- move to hush-chat/scripts/k6-load-testing
- run scripts by `k6 run <script_name>.js`

## NOTE
- make sure baseURL and tenant set
- each scripts run on different conditions. check each script before run to fill essential fields