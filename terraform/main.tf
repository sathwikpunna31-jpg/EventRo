terraform {
  backend "s3" {
    bucket = "eventro-terraform-state-995158692236"
    key    = "eventro/terraform.tfstate"
    region = "ap-south-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Existing EventRo VPC
data "aws_vpc" "eventro" {
  id = "vpc-0b42899a2ecac5c83"
}

# Existing EventRo subnet
data "aws_subnet" "eventro" {
  id = "subnet-06a711a7d996654f9"
}

# Existing EventRo Security Group
resource "aws_security_group" "eventro" {
  name        = "launch-wizard-4"
  description = "launch-wizard-4 created 2026-09-11T10:35:10.213Z"
  vpc_id      = data.aws_vpc.eventro.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["103.152.184.99/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${local.project}-Production"
    Environment = local.environment
    ManagedBy   = local.managed_by
  }
}

# EventRo EC2 is now managed through the module.
module "eventro_compute" {
  source = "./modules/eventro_compute"

  ami               = "ami-01a00762f46d584a1"
  instance_type     = "t3.small"
  subnet_id         = data.aws_subnet.eventro.id
  security_group_id = aws_security_group.eventro.id
  instance_name     = "EventRo-DevOps-Server"
}

# Tell Terraform that the existing EC2 resource
# moved from the root configuration into the module.
moved {
  from = aws_instance.eventro
  to   = module.eventro_compute.aws_instance.eventro
}