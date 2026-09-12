pipeline {
    agent any

    stages {
        stage('Verify') {
            steps {
                sh 'echo "Jenkins is running the EventRo pipeline"'
                sh 'node --version'
                sh 'npm --version'
                sh 'docker --version'
		sh 'docker ps'
            }
        }
    	stage('Frontend Build') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }
    }
}
