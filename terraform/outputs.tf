output "security_group_id" {
  description = "ID of the EventRo security group"
  value       = aws_security_group.eventro.id
}

output "instance_id" {
  description = "ID of the EventRo EC2 instance"
  value       = module.eventro_compute.instance_id
}

output "public_ip" {
  description = "Public IP address of the EventRo EC2 instance"
  value       = module.eventro_compute.public_ip
}