# Contact Us Application

This project is a Contact Us web application built with Node.js and PostgreSQL, is a containerised Node.js web application deployed on Google Cloud Platform (GCP). this project is a contact us form where users submit messages, those are stored in a postgresql database using sequelize ORM. 
the application is deployed using google cloud run,google cloud sql for database and google artifact registry for container registry with a CI/CD pipeline using google cloud build triggered by github.

## Architecture

**Components:**
1. **Frontend**: HTML, CSS, and JavaScript served statically.
2. **Backend**: Node.js, postgreSQL 17,Express server.
3. **Compute**: Containerised application (Docker).
4. **services**: Google Cloud Run, Google Cloud SQL (postgresql), Google Artifact Registry, google secret manager, Google Cloud Build.

# Deployment Instructions
## github initial setup
- create a new repository in github
- connect the repository to local
- initial commit of readme.md, git ignore and license.
- push the changes to github

## Prerequisites
- Google Cloud Platform account 
- billing enabled for the project
- github account

### enable services
- google cloud run
- google cloud sql
- google artifact registry
- google secret manager
- google cloud build

## github base app commitment
- Commit base application to GitHub
- Push changes to main branch

## Configure Cloud SQL

-Create a PostgreSQL instance in Cloud SQL
-Create a database (e.g. contact_db)
-Create a database user andpassword 
-Configure Secret Manager

## Configure secret manager

### Store the database url in secret manager:
-create the secret manager
echo -n "postgresql://secure_user:secure_password@/client_info?host=/cloudsql/YOUR_PROJECT_ID:REGION:INSTANCE_NAME" | \
gcloud secrets create DATABASE_URL --data-file=-

### Grant access to the Cloud Run service account:

gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

## create artifact registry

Docker images are stored in Artifact Registry (recommended over legacy gcr.io). 
- Create a Docker repository (example name: contact-repo) in the same region asdeploy Cloud Run.

gcloud artifacts repositories create contact-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for Contact App images"

Configure Docker authentication for Artifact Registry:

    gcloud auth configure-docker us-central1-docker.pkg.dev

After this, Cloud Build can push images.

## Cloud Build Configuration

- Create a cloudbuild.yaml file in the root directory of your repository.

The deployment pipeline is defined in cloudbuild.yaml and includes:

-Installing dependencies
-Building the Docker image
-Pushing the image to Artifact Registry
-Deploying the image to Cloud Run

Deployment is fully automated and requires no manual intervention.

## Create Cloud Build Trigger

Open Cloud Build → Triggers

-Connect your GitHub repository
-Configure trigger:
-Event: Push to branch
-Branch: main
-Configuration: cloudbuild.yaml

The Cloud Run service is deployed automatically after the Cloud Build trigger runs, which is activated by a GitHub push.

## Verify Deployment

After a successful build:

-Open Cloud Run in the GCP Console
-Select contact-app-service
-you will have access to the public HTTPS URL

## 📄 License
This project is licensed under the MIT License.