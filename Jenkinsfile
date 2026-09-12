pipeline {
    agent any

    stages {
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
