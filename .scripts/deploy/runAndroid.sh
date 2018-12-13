set -e
yarn install
yarn deploy -t main-app --deploy-env alpha-deploygate --android
