
# Team Testing Instructions (via AWS Session Manager)

This guide allows you to run and test the backend code on the EC2 instance **without using a public IP address**, ensuring there are no additional costs.

## 1. Log into EC2 using Session Manager

1. Go to: AWS Console > EC2 > Instances
2. Select the instance named `vitalwatch-node-west`
3. Click **Connect**
4. Choose **Session Manager** tab
5. Click **Start session**

## 2. Switch to the Ubuntu user

This gives you access to the right directory and permissions.

```bash
sudo su ubuntu
```

## 3. Navigate to the backend folder

```bash
cd /home/ubuntu
cd vitalwatch-backend/ICU-Clinical-Assistant
```

If you see an error, double-check with `ls` and verify that you're in `/home/ubuntu`.

## 4. Install Node.js dependencies

This is required once. If already installed, you can skip this step. (skip this for now)

```bash
npm install
```

## 5. Start the server

```bash
node index.js
```

Expected output:

```
Server running on http://localhost:3000
```

Keep this terminal open. You are now hosting the backend locally.

## 6. Open a second session for testing

Go back to EC2 > Instances > Connect > Session Manager > Start a new session.

## 7. Test the API

```bash
curl http://localhost:3000/api/vitals
```

You should see a JSON response with sample vitals data.

## 8. Stop the server when done

Go back to the first session (running the server) and press:

```
Ctrl + C
```

This stops the Node.js server.

## Notes

- All communication happens on `localhost` so no network cost is incurred.
- If you make changes to code, restart the server.
- Make sure you're always using `sudo su ubuntu` in Session Manager to access project files.
