output "instance_id" {
  description = "ID of the EventRo EC2 instance"
  value       = aws_instance.eventro.id
}

output "public_ip" {
  description = "Public IP address of the EventRo EC2 instance"
  value       = aws_instance.eventro.public_ip
}