pipeline {
    agent any

    environment {
        IMAGE_TAG = "${env.GIT_COMMIT.take(7)}"
    }

    stages {

        stage('Verify') {
            steps {
                sh 'echo "Jenkins is running the EventRo pipeline"'
                sh 'echo "Git commit: $GIT_COMMIT"'
                sh 'echo "Docker image tag: $IMAGE_TAG"'
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

        stage('Backend CI') {
            steps {
                sh '''
                    docker network create eventro-ci-network

                    docker run -d \
                        --name eventro-ci-mongodb \
                        --network eventro-ci-network \
                        mongo:7.0

                    docker build -t eventro-backend:$IMAGE_TAG ./backend

                    docker run -d \
                        --name eventro-ci-backend \
                        --network eventro-ci-network \
                        -e PORT=5050 \
                        -e MONGO_URI=mongodb://eventro-ci-mongodb:27017/eventro-ci \
                        -p 127.0.0.1:5050:5050 \
                        eventro-backend:$IMAGE_TAG

                    sleep 10

                    curl --fail http://127.0.0.1:5050/
                '''
            }
        }
    }

    post {
        always {
            sh '''
                docker rm -f eventro-ci-backend || true
                docker rm -f eventro-ci-mongodb || true
                docker network rm eventro-ci-network || true
            '''
        }
    }
}
