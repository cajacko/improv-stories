set -e
yarn install --network-concurrency 1
yarn deploy -t main-app --deploy-env alpha-deploygate --android
