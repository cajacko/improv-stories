docker stop api
docker rm api

set -e

command="docker create"

# Get all the env keys and pass in from the host
str=$(egrep -v '^#' .env | xargs)
IFS=" "
ary=($str)
for key in "${!ary[@]}";
do
  str2="${ary[$key]}"
  IFS="="
  ary2=($str2)
  command="${command} -e ${ary2[0]}"
done

command="${command} -it --name=api node:6.15.1-alpine sh /App/.scripts/deploy/runApi.sh"

# Execute the docker run command with all the env set
eval $command

docker cp . api:/App
# docker cp ../lib/packages/template/dist api:/App/dist
docker start api
docker logs --follow api
code=$(docker inspect api --format='{{.State.ExitCode}}')
docker stop api
docker rm api

exit $code
