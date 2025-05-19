terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com"
  ])
  
  project = var.project_id
  service = each.key

  disable_dependent_services = false
  disable_on_destroy        = false
}

# Create Artifact Registry repository
resource "google_artifact_registry_repository" "feedback-analyzer" {
  location      = var.region
  repository_id = var.service_name
  description   = "Docker repository for Feedback Analyzer"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# Deploy to Cloud Run
resource "google_cloud_run_v2_service" "feedback-analyzer" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = "eu.gcr.io/${var.project_id}/${var.service_name}:${var.sha}"
      
      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      env {
        name  = "ALLOWED_ORIGINS"
        value = var.allowed_origins
      }
    }

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
  }

  depends_on = [google_project_service.required_apis]
}

# Make the service publicly accessible
resource "google_cloud_run_service_iam_member" "public" {
  location = google_cloud_run_v2_service.feedback-analyzer.location
  service  = google_cloud_run_v2_service.feedback-analyzer.name
  role     = "roles/run.invoker"
  member   = "allUsers"
} 