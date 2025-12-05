set -e

echo "============================================"
echo "HushChat Deployment Script Started"
echo "============================================"


echo "Building backend using Maven..."
yarn build:backend
echo "✔ Backend build completed."


echo "Stopping existing docker containers..."
docker compose down
echo "✔ Docker containers stopped."


echo "Starting docker containers..."
docker compose up --build -d
echo "✔ Deployment completed successfully!"

echo "============================================"
echo "Deployment Finished Successfully!"
echo "============================================"
