set -e
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
yarn install
yarn deploy -t main-app --deploy-env alpha-deploygate --android
