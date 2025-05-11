# ICU Clinical Assistant

A Node.js + PostgreSQL backend that serves ICU vitals data via a REST API, fully deployed on AWS following best practices: custom VPC, private RDS, EC2 with SSM-only access, Application Load Balancer, and Auto Scaling.

---

## Repository Structure

```
/
├── index.js                    # Express server entrypoint
├── package.json                # Node.js dependencies & scripts
├── .env.example                # Environment variables template
├── cloudFormationVitalWatch.yaml  # CloudFormation IaC template
└── README.md                   # This documentation
```

* **index.js**

  * Reads database connection settings from environment variables
  * Defines `GET /api/vitals` endpoint to return ICU vitals JSON

* **.env.example**

  * Template for local or EC2 environment variables (copy to `.env`)

* **cloudFormationVitalWatch.yaml**

  * AWS CloudFormation template provisioning:

    * VPC with public & private subnets
    * Internet Gateway & NAT Gateway
    * Public & private route tables
    * EC2 instance (private subnet) with SSM role
    * RDS PostgreSQL instance (private subnets)
    * Security Groups and IAM Roles

---

##  Running Locally

1. **Clone the repo**

   ```bash
   git clone https://github.com/<your-org>/ICU-Clinical-Assistant.git
   cd ICU-Clinical-Assistant
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your local Postgres credentials
   # Example:
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_NAME=vitaldb
   PORT=3000
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the server**

   ```bash
   npm start
   ```

5. **Test**
   Open your browser or curl:

   ```bash
   curl http://localhost:3000/api/vitals
   ```

---

##  AWS Deployment via CloudFormation template attached in this repo and named -> cloudFormationVitalWatch.yaml

### Prerequisites

* AWS CLI configured with sufficient IAM permissions
* An EC2 key pair in your AWS account
* An Ubuntu AMI ID (e.g., `ami-0abcdef1234567890`)
* Node.js v18+ runtime on EC2

### Deploy the Stack

```bash
aws cloudformation deploy \
  --template-file cloudFormationVitalWatch.yaml \
  --stack-name VitalWatchStack \
  --parameter-overrides \
      AmiId=ami-0abcdef1234567890 \
      KeyName=your-keypair \
      DBUsername=postgres \
      DBPassword=MySecureDbPass! \
  --capabilities CAPABILITY_NAMED_IAM
```

This will provision:

* **VPC** (10.0.0.0/16) with 2 public & 2 private subnets
* Internet Gateway & NAT Gateway
* Public & private route tables
* **Security Groups**:

  * EC2SG: outbound all, no inbound
  * RDSSG: allows port 5432 from EC2SG
* IAM Role & Instance Profile for Systems Manager
* **EC2 Instance** in private subnet (no SSH, SSM only)
* **RDS PostgreSQL** in private subnets

Outputs include VPC ID, EC2 Instance ID, and RDS Endpoint.

---

##  Connect & Run on EC2

1. In the AWS Console, navigate to **Systems Manager → Session Manager**, and start a session on the EC2 instance.
2. Download the preprocessed postgres sql dump from google drive link attached-> https://drive.google.com/file/d/1vts4-6_f7Dk_m6FXyTDHi8UT05RZylq0/view?usp=sharing
3. Clone and start the app:

   ```bash
   cd /home/ubuntu
   git clone https://github.com/sanskruti-raut/ICU-Clinical-Assistant.git
   cd ICU-Clinical-Assistant/icu-backend_PAYAL/
   cp .env.example .env
   # Edit .env: set DB_HOST to the RDS endpoint from CloudFormation outputs
   npm install
   npm start

   once all the modules are loaded run the app by node index.js
   ```
4. The server will be listening on `localhost:3000` inside the instance.

---

##  Application Load Balancer & Auto Scaling

1. **Target Group**

   * Type: Instance
   * Protocol: HTTP, Port: 3000
   * Health check: `HTTP /api/vitals`

2. **Application Load Balancer**

   * Scheme: Internet-facing
   * VPC: Your ICU VPC → Public subnets
   * Security Group: allow HTTP (80) from `0.0.0.0/0`
   * Listener: Port 80 → Target Group

3. **Auto Scaling Group**

   * Launch Template: same AMI, instance type, IAM role, SG
   * User Data: scripts to pull repo, install, and `npm start`
   * Subnets: Public subnets
   * Desired/Min/Max capacity: `1 / 1 / 2`
   * Attach to the ALB Target Group

This ensures your backend scales across two AZs with automatic instance registration.

---

## Cost Considerations

* **EC2**: t2.micro (free tier eligible) ×1–2 instances
* **RDS**: db.t3.micro (free tier up to 750 hours/mo)
* **NAT Gateway** & **Elastic IP**: small hourly charges
* **ALB**: load balancer-hour + LCU-hours

Monitor your AWS Cost Explorer for accurate billing.

---

## Summary

This project demonstrates:

* Secure network isolation with custom VPC & subnets
* Private RDS hosting for data protection
* IAM-based SSM-only EC2 access (no SSH)
* Infrastructure as Code using CloudFormation
* Scalable, fault-tolerant backend behind an ALB

For full infrastructure details or customization, refer to `cloudFormationVitalWatch.yaml`.
