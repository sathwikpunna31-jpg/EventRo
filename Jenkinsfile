pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify') {
            steps {
                sh 'echo "Jenkins is running the EventRo pipeline"'
                sh 'node --version'
                sh 'npm --version'
                sh 'docker --version'
            }
        }
    }
}
