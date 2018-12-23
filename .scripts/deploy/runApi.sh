set -e
cd /App

yarn install --ignore-engines
# rm -rf node_modules/@cajacko/template/dist
# mv dist node_modules/@cajacko/template/dist
yarn deploy -t api
