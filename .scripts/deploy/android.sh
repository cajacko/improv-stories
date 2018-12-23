docker stop android
docker rm android

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

command="${command} -it --name=android cajacko/android:0.2.0 sh ./.scripts/deploy/runAndroid.sh"

# Execute the docker run command with all the env set
eval $command

docker cp . android:/App
docker start android
docker logs --follow android
code=$(docker inspect android --format='{{.State.ExitCode}}')
docker stop android
docker rm android

exit $code
