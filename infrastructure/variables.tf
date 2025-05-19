variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region to deploy to"
  type        = string
}

variable "service_name" {
  description = "The name of the Cloud Run service"
  type        = string
}

variable "sha" {
  description = "The git SHA of the commit being deployed"
  type        = string
}

variable "memory" {
  description = "Memory allocation for the Cloud Run service"
  type        = string
}

variable "cpu" {
  description = "CPU allocation for the Cloud Run service"
  type        = string
}

variable "min_instances" {
  description = "Minimum number of instances for the Cloud Run service"
  type        = number
}

variable "max_instances" {
  description = "Maximum number of instances for the Cloud Run service"
  type        = number
}

variable "allowed_origins" {
  description = "Comma-separated list of allowed origins for CORS"
  type        = string
} 